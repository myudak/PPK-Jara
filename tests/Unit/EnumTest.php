<?php

namespace Tests\Unit;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use PHPUnit\Framework\TestCase;

class EnumTest extends TestCase
{
    public function test_shared_contract_enum_values_are_stable(): void
    {
        $this->assertSame(['USER', 'ADMIN'], array_column(UserRole::cases(), 'value'));
        $this->assertSame(['ACTIVE', 'DISABLED'], array_column(UserStatus::cases(), 'value'));
        $this->assertSame(
            ['TODO', 'IN_PROGRESS', 'COMPLETED'],
            array_column(TaskStatus::cases(), 'value'),
        );
        $this->assertSame(
            ['LOW', 'MEDIUM', 'HIGH'],
            array_column(TaskPriority::cases(), 'value'),
        );
    }
}
