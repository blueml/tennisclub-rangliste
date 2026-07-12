from pydantic import BaseModel, EmailStr


class PlayerLoginRequest(BaseModel):
    email: EmailStr
    password: str


class AdminLoginRequest(BaseModel):
    username: str
    password: str


class ChangePasswordRequest(BaseModel):
    newPassword: str


class CreatePlayerRequest(BaseModel):
    name: str
    email: EmailStr
    initialPassword: str


class UpdatePlayerEmailRequest(BaseModel):
    email: EmailStr


class ResetPlayerPasswordRequest(BaseModel):
    newPassword: str


class CreateMatchRequest(BaseModel):
    defenderId: str


class ConfirmResultRequest(BaseModel):
    winnerId: str


class AdminResolveRequest(BaseModel):
    winnerId: str
