export class ActionCardRequirmentsHandler {
  constructor(public isActivated: boolean, public requirements: string[]) {
    this.isActivated = isActivated;
    this.requirements = requirements;
  }
}
