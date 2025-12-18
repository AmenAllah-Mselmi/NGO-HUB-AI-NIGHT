import supabase from '../../../utils/supabase';
import { 
  type Objectif, 
  type UserObjectifInfos, 
  type UserObjectif,
  type GroupObjectif,
  ObjectifActionType,
  FeaturesType,
  ObjectifDifficulty,
  PrivacyType,
  CibleType 
} from '../types/objectives';

export const objectivesService = {
  // Fetch all available objectives info for a specific user (combining definition + progress)
  async getUserObjectives(userId: string): Promise<UserObjectifInfos[]> {
    try {
      // 1. Fetch all objectives
      const { data: objectives, error: objError } = await supabase
        .from('objectives')
        .select('*')
        .eq('is_active', true);
      
      if (objError) throw objError;

      // 2. Fetch user's progress on these objectives
      const { data: userProgress, error: progError } = await supabase
        .from('member_objectives')
        .select('*')
        .eq('member_id', userId);

      if (progError) throw progError;

      // 3. Combine data
      const combined: UserObjectifInfos[] = objectives.map((obj: any) => {
        // Map snake_case DB fields to camelCase TS interface
        const mappedObj: Objectif = {
          id: obj.id,
          groupObjectif: obj.group_objectif as GroupObjectif,
        objectifActionType: obj.objectif_action_type as ObjectifActionType, // Note: DB column is 'objectif_action_type'
          privacy: obj.privacy as PrivacyType,
          cible: obj.cible as CibleType[],
          difficulty: obj.difficulty as ObjectifDifficulty,
          feature: obj.feature as FeaturesType,
          target: obj.target || undefined,
          points: obj.points
        };

        const progress = userProgress?.find(p => p.objective_id === obj.id);
        
        const userObj: UserObjectif | null = progress ? {
          objectifId: obj.id,
          currentProgress: progress.current_progress,
          isCompleted: progress.is_completed,
          assignedAt: progress.assigned_at
        } : null;

        return {
          objectif: mappedObj,
          userObjectif: userObj
        };
      });

      return combined;

    } catch (error) {
      console.error('Error fetching user objectives:', error);
      throw error;
    }
  },

  // Create a new objective definition
  async createObjective(objective: Omit<Objectif, 'id'>): Promise<Objectif> {
    try {
      const dbPayload = {
        group_objectif: objective.groupObjectif,
        objectif_action_type: objective.objectifActionType,
        feature: objective.feature,
        privacy: objective.privacy || null,
        cible: objective.cible,
        difficulty: objective.difficulty || null,
        target: objective.target || null,
        points: objective.points,
        title: ` ${objective.objectifActionType}   ${objective.points} ${objective.privacy} ${objective.feature} (${objective.difficulty})`,
      };

      const { data, error } = await supabase
        .from('objectives')
        .insert(dbPayload)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        groupObjectif: data.group_objectif,
        objectifActionType: data.objectif_action_type,
        feature: data.feature,
        privacy: data.privacy,
        cible: data.cible,
        difficulty: data.difficulty,
        target: data.target,
        points: data.points
      };
    } catch (error) {
      console.error('Error creating objective:', error);
      throw error;
    }
  },

  // Assign an objective to a user
  async assignObjectiveToUser(userId: string, objectiveId: string): Promise<void> {
    const { error } = await supabase
      .from('member_objectives')
      .insert({
        member_id: userId,
        objective_id: objectiveId,
        current_progress: 0,
        is_completed: false
      });
      
    if (error) throw error;
  },

  // Unassign objective from user
  async unassignObjective(userId: string, objectiveId: string): Promise<void> {
    const { error } = await supabase
      .from('member_objectives')
      .delete()
      .eq('member_id', userId)
      .eq('objective_id', objectiveId);

    if (error) throw error;
  },

  // Permanently delete an objective definition (Admin)
  async deleteObjective(objectiveId: string): Promise<void> {
    const { error } = await supabase
      .from('objectives')
      .delete()
      .eq('id', objectiveId);

    if (error) throw error;
  },

  // Update progress
  async updateProgress(userId: string, objectiveId: string, progress: number): Promise<void> {
    // We check if it's completed in the DB trigger, but we pass is_completed=true if progress >= target here?
    // Actually the trigger works on is_completed = true.
    // Ideally the frontend or backend logic should determine if it's completed.
    // Let's fetch the target first? Or just update progress and let a DB function handle completion?
    // User requested "update the progress", usually this means updating the count. 
    // If we want the trigger to fire, we must set is_completed = true. 
    
    // Fetch target first to know if we should complete it
    const { data: objData, error: objError } = await supabase
      .from('objectives')
      .select('target')
      .eq('id', objectiveId)
      .single();
    
    if (objError) throw objError;
    
    const target = objData.target || 1;
    const isCompleted = progress >= target;

    const { error } = await supabase
      .from('member_objectives')
      .upsert({
        member_id: userId,
        objective_id: objectiveId,
        current_progress: progress,
        is_completed: isCompleted, // Trigger will fire if this flips to true
        updated_at: new Date().toISOString()
      }, { onConflict: 'member_id, objective_id' });

    if (error) throw error;
  }
};
