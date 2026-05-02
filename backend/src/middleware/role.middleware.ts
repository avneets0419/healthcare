import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export const roleMiddleware = (allowedRoles: ("admin" | "doctor" | "patient")[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    
    const user = req.user;
    


    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden: Access denied"});
    }

    

    next();
  };
};