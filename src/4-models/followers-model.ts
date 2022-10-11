class FollowersModel {
  public vacationId: number;
  public userId: string;

  public constructor(vacationToFollow: FollowersModel) {
    this.vacationId = vacationToFollow.vacationId;
    this.userId = vacationToFollow.userId;
  }
}

export default FollowersModel;
