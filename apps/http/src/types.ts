import { User, Session } from "@sandboox/auth/server";

export interface Variables {
    user: User | null;
    session: Session | null;
}
