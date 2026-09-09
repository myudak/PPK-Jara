<?php

namespace Tests\Feature\Authorization;

use App\Http\Middleware\EnsureUserIsAdmin;
use App\Models\TaskList;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class AuthorizationFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_middleware_rejects_users_and_allows_admins(): void
    {
        $middleware = app(EnsureUserIsAdmin::class);
        $request = Request::create('/api/admin/check');

        $request->setUserResolver(fn () => User::factory()->create());
        $denied = $middleware->handle($request, fn () => response()->json(['ok' => true]));
        $this->assertSame(403, $denied->getStatusCode());

        $request->setUserResolver(fn () => User::factory()->admin()->create());
        $allowed = $middleware->handle($request, fn () => response()->json(['ok' => true]));
        $this->assertSame(200, $allowed->getStatusCode());
    }

    public function test_task_list_policy_distinguishes_owner_member_and_unrelated_user(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $outsider = User::factory()->create();
        $list = TaskList::factory()->for($owner, 'owner')->create();
        $list->members()->attach($member, ['joined_at' => now()]);

        $this->assertTrue($owner->can('view', $list));
        $this->assertTrue($member->can('view', $list));
        $this->assertFalse($outsider->can('view', $list));
        $this->assertTrue($owner->can('manageMembers', $list));
        $this->assertFalse($member->can('manageMembers', $list));
    }
}
