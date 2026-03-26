import { activitiesTypes } from '../../type/Project/activities.types';

export const activitiesCount = count => ({type: activitiesTypes.ACTIVITIES_COUNT, count: count});