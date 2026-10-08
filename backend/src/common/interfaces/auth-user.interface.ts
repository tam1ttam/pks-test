import type { User } from '../../database/entities/user.entity';

export interface AuthUser { user: User; sessionId: string }
