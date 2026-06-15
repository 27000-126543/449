export type Position = [number, number, number];

export type AnimalStatus = 'normal' | 'warning' | 'danger' | 'lost';

export type AnimalSpecies = 'tiger' | 'elephant' | 'panda' | 'deer' | 'monkey' | 'leopard';

export interface Animal {
  id: string;
  species: AnimalSpecies;
  name: string;
  heartRate: number;
  temperature: number;
  position: Position;
  trajectory: Position[];
  status: AnimalStatus;
  groupId: string;
  stationaryTime: number;
  lastUpdate: Date;
  age: number;
  gender: 'male' | 'female';
}

export type RangerRole = 'ranger' | 'director' | 'bureau';

export interface Ranger {
  id: string;
  name: string;
  role: RangerRole;
  position: Position;
  shiftDuration: number;
  inBlindZone: boolean;
  blindZoneTime: number;
  trajectory: Position[];
  avatar?: string;
  status: 'on_duty' | 'off_duty' | 'patrolling' | 'resting';
}

export interface CaptureRecord {
  id: string;
  timestamp: Date;
  imageUrl: string;
  hasHuman: boolean;
  confidence: number;
  animalSpecies?: string;
}

export interface Camera {
  id: string;
  name: string;
  position: Position;
  battery: number;
  storage: number;
  captures: CaptureRecord[];
  hasHumanDetection: boolean;
  lastCapture?: Date;
  status: 'online' | 'offline' | 'low_battery';
}

export type DroneStatus = 'idle' | 'patrolling' | 'alert' | 'returning' | 'charging';

export interface Drone {
  id: string;
  name: string;
  position: Position;
  status: DroneStatus;
  battery: number;
  patrolRoute: Position[];
  currentRouteIndex: number;
  speed: number;
  altitude: number;
}

export type AlertType = 'stationary' | 'lost_signal' | 'poaching' | 'intrusion' | 'injury';

export type AlertLevel = 'low' | 'medium' | 'high' | 'critical';

export type AlertStatus = 'pending' | 'processing' | 'resolved' | 'false_alarm';

export interface Alert {
  id: string;
  type: AlertType;
  animalId?: string;
  cameraId?: string;
  rangerId?: string;
  position: Position;
  level: AlertLevel;
  timestamp: Date;
  status: AlertStatus;
  assignedRangerId?: string;
  searchPath: Position[];
  description: string;
}

export type WorkOrderType = 'trap_destruction' | 'rescue' | 'patrol' | 'investigation';

export type WorkOrderStatus = 'pending' | 'assigned' | 'in_progress' | 'completed';

export interface WorkOrder {
  id: string;
  type: WorkOrderType;
  position: Position;
  droneId?: string;
  assignedRangerId?: string;
  status: WorkOrderStatus;
  createdAt: Date;
  routePath: Position[];
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export type ApprovalType = 'poaching' | 'rescue' | 'patrol' | 'drone_deployment';

export type ApprovalStatus =
  | 'pending_level1'
  | 'pending_level2'
  | 'pending_level3'
  | 'approved'
  | 'rejected';

export interface Approval {
  id: string;
  type: ApprovalType;
  targetId: string;
  status: ApprovalStatus;
  level1By?: string;
  level1Comment?: string;
  level1At?: Date;
  level2By?: string;
  level2Comment?: string;
  level2At?: Date;
  level3By?: string;
  level3Comment?: string;
  level3At?: Date;
  chasePath?: Position[];
  createdAt: Date;
  description: string;
}

export interface RescueStation {
  id: string;
  name: string;
  position: Position;
  capacity: number;
  staffCount: number;
  equipment: string[];
}

export interface Rescue {
  id: string;
  animalId: string;
  injuryType: string;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  stationId: string;
  route: Position[];
  status: 'reported' | 'approved' | 'in_transit' | 'treated' | 'released';
  createdAt: Date;
  vetSignoff?: boolean;
  caretakerSignoff?: boolean;
  directorSignoff?: boolean;
}

export interface HeatMapPoint {
  position: Position;
  intensity: number;
  riskLevel: 'green' | 'yellow' | 'red';
}

export interface User {
  id: string;
  name: string;
  role: RangerRole;
  avatar?: string;
  lastLogin?: Date;
}

export interface OperationLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  targetType: string;
  targetId: string;
  timestamp: Date;
  details: string;
}
