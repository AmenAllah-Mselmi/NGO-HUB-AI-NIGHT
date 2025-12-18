import { 
  GroupObjectif, 
  ObjectifActionType, 
  FeaturesType 
} from '../types/objectives';

// Define the structure for Group -> Actions -> Features mapping
type ObjectivesMapping = {
  [key in GroupObjectif]: {
    actions: {
      [key in ObjectifActionType]?: FeaturesType[];
    };
    privacyDisabled?: boolean;
  };
};

export const groupsObjectifs: ObjectivesMapping = {
  [GroupObjectif.AttendanceCheck]: {
    actions: {
      [ObjectifActionType.CheckIn]: [FeaturesType.Events, FeaturesType.Meetings, FeaturesType.Trainings],
      [ObjectifActionType.Attend]: [FeaturesType.Events, FeaturesType.Meetings, FeaturesType.Trainings],
    }
  },
  [GroupObjectif.Modification]: {
    actions: {
      [ObjectifActionType.Create]: [FeaturesType.Projects, FeaturesType.Tasks, FeaturesType.Teams, FeaturesType.Events],
      [ObjectifActionType.Update]: [FeaturesType.Projects, FeaturesType.Tasks, FeaturesType.Teams],
      [ObjectifActionType.Delete]: [FeaturesType.Projects, FeaturesType.Tasks, FeaturesType.Teams],
    }
  },
  [GroupObjectif.Interaction]: {
    actions: {
      [ObjectifActionType.Send]: [FeaturesType.Comments, FeaturesType.Replys],
      [ObjectifActionType.ReplyTo]: [FeaturesType.Comments, FeaturesType.Replys],
      [ObjectifActionType.ReactTo]: [FeaturesType.Comments, FeaturesType.Replys, FeaturesType.Board],
    }
  },
  [GroupObjectif.Decision]: {
    actions: {
      [ObjectifActionType.VoteIn]: [FeaturesType.Votes, FeaturesType.Board],
    }
  },
  [GroupObjectif.Contribution]: {
    actions: {
      [ObjectifActionType.Create]: [FeaturesType.Strategies, FeaturesType.Subtasks],
      [ObjectifActionType.Join]: [FeaturesType.Teams, FeaturesType.Projects],
    }
  },
  [GroupObjectif.Exploration]: {
    actions: {
      [ObjectifActionType.Discover]: [FeaturesType.Members, FeaturesType.Guests, FeaturesType.PastPresident, FeaturesType.Culture],
    },
    privacyDisabled: true,
  }
};

export const getActionTypesByGroup = (group: GroupObjectif): ObjectifActionType[] => {
  const groupConfig = groupsObjectifs[group];
  return groupConfig ? (Object.keys(groupConfig.actions) as ObjectifActionType[]) : [];
};

export const getFeaturesByGroup = (group: GroupObjectif, action: ObjectifActionType): FeaturesType[] => {
  const groupConfig = groupsObjectifs[group];
  if (!groupConfig) return [];
  return groupConfig.actions[action] || [];
};

export const isPrivacyNullForGroup = (group: GroupObjectif): boolean => {
  return groupsObjectifs[group]?.privacyDisabled || false;
};
