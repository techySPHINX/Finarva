export class ClientProfileDto {
  id!: string;
  name!: string;
  phone!: string;
  agentId!: string;
  language!: string;
  goals!: string[];
  age?: number;
  gender?: string;
  income?: number;
  interests?: string[];
}
