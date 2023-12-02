import { TimetableData } from "./interfaces";

export const getMergedTimetableData = (
  dataOld: TimetableData,
  dataNew: TimetableData,
): TimetableData => {
  let { S1, S2, Summer, T1, T2, T3, Other } = dataOld;
  // Concatenate arrays for specific fields
  S1 = S1.concat(dataNew.S1);
  S2 = S2.concat(dataNew.S2);
  Summer = Summer.concat(dataNew.Summer);
  T1 = T1.concat(dataNew.T1);
  T2 = T2.concat(dataNew.T2);
  T3 = T3.concat(dataNew.T3);
  Other = Other.concat(dataNew.Other);

  // Create the new object
  return {
    S1,
    S2,
    Summer,
    T1,
    T2,
    T3,
    Other,
  };
};
