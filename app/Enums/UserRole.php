<?php

namespace App\Enums;

enum UserRole: string
{
    case User = 'USER';
    case Admin = 'ADMIN';
}
