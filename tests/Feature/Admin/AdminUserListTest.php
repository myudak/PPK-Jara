<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserListTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_receives_unauthenticated_for_user_list(): void
    {
        $this->getJson('/api/admin/users')
            ->assertUnauthorized()
            ->assertExactJson([
                'success' => false,
                'message' => 'Unauthenticated.',
            ]);
    }

    public function test_regular_user_receives_forbidden_for_user_list(): void
    {
        $this->actingAs(User::factory()->create())
            ->getJson('/api/admin/users')
            ->assertForbidden()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Administrator access is required.');
    }

    public function test_admin_can_list_users_sorted_by_name_with_pagination_meta(): void
    {
        $admin = User::factory()->admin()->create(['name' => 'Admin Alan']);

        User::factory()->disabled()->create(['name' => 'User Carol']);
        User::factory()->create(['name' => 'User Bob']);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/users')
            ->assertOk()
            ->assertJsonPath('success', true);

        $users = collect($response->json('data.users'));

        $this->assertSame(['Admin Alan', 'User Bob', 'User Carol'], $users->pluck('name')->all());

        $carol = $users->firstWhere('name', 'User Carol');
        $this->assertSame('DISABLED', $carol['status']);

        $response->assertJsonPath('data.meta.total', 3)
            ->assertJsonPath('data.meta.per_page', 15)
            ->assertJsonPath('data.meta.current_page', 1)
            ->assertJsonPath('data.meta.last_page', 1);
    }

    public function test_user_list_paginates_beyond_first_page(): void
    {
        $admin = User::factory()->admin()->create();

        User::factory()->count(20)->create();

        $this->actingAs($admin)
            ->getJson('/api/admin/users?page=2')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.meta.total', 21)
            ->assertJsonPath('data.meta.last_page', 2)
            ->assertJsonCount(6, 'data.users');
    }
}
