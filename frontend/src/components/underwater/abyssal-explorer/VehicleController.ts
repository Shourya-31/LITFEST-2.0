export interface PlayerInput {
  forward: boolean;
  reverse: boolean;
  left: boolean;
  right: boolean;
  boost: boolean;
  interact: boolean;
  sonar: boolean;
}

const MAX_FORWARD_SPEED = 25;
const MAX_REVERSE_SPEED = 11;

export class VehicleController {
  public position = { x: 0, y: 6, z: 0 };
  public velocity = { x: 0, y: 0, z: 0 };
  public yaw = 0;
  public pitch = 0;
  public roll = 0;
  public boostMeter = 1;
  private buoyancyClock = 0;

  public update(delta: number, input: PlayerInput) {
    const forwardPower = Number(input.forward) - Number(input.reverse);
    const turnPower = Number(input.right) - Number(input.left);
    const boostActive = input.boost && this.boostMeter > 0.1 && forwardPower > 0;

    if (boostActive) {
      this.boostMeter = Math.max(0, this.boostMeter - delta * 0.32);
    } else {
      this.boostMeter = Math.min(1, this.boostMeter + delta * 0.18);
    }

    this.velocity.z += forwardPower * (boostActive ? 32 : 18) * delta;
    this.velocity.z *= Math.exp(-0.68 * delta);
    this.velocity.z = Math.max(-MAX_REVERSE_SPEED, Math.min(MAX_FORWARD_SPEED, this.velocity.z));

    const steeringGrip = 0.45 + Math.min(Math.abs(this.velocity.z) / MAX_FORWARD_SPEED, 1) * 0.8;
    this.yaw -= turnPower * steeringGrip * delta * (this.velocity.z < -0.4 ? -1 : 1);

    const forwardX = -Math.sin(this.yaw);
    const forwardZ = -Math.cos(this.yaw);
    this.position.x += forwardX * this.velocity.z * delta;
    this.position.z += forwardZ * this.velocity.z * delta;
    this.velocity.x = forwardX * this.velocity.z;

    this.buoyancyClock += delta;
    this.position.y += Math.sin(this.buoyancyClock * 0.75) * 0.18 * delta;
    this.pitch = Math.max(-0.2, Math.min(0.2, this.velocity.z * 0.008));
    this.roll += (turnPower * 0.25 - this.roll) * Math.min(1, delta * 3);

    const bounds = 82;
    this.position.x = Math.max(-bounds, Math.min(bounds, this.position.x));
    this.position.z = Math.max(-bounds, Math.min(bounds, this.position.z));
    this.position.y = Math.max(2.5, Math.min(24, this.position.y));
  }

  public reset() {
    this.position.x = 0;
    this.position.y = 6;
    this.position.z = 0;
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.velocity.z = 0;
    this.yaw = 0;
    this.pitch = 0;
    this.roll = 0;
    this.boostMeter = 1;
    this.buoyancyClock = 0;
  }
}
