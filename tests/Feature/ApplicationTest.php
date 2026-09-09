<?php

namespace Tests\Feature;

use Tests\TestCase;

class ApplicationTest extends TestCase
{
    public function test_spa_shell_boots_at_root_and_direct_routes(): void
    {
        $this->get('/')->assertOk()->assertViewIs('app');
        $this->get('/lists/42')->assertOk()->assertViewIs('app');
        $this->get('/admin/users')->assertOk()->assertViewIs('app');
    }

    public function test_unknown_api_endpoint_uses_the_error_contract(): void
    {
        $this->getJson('/api/not-a-real-endpoint')
            ->assertNotFound()
            ->assertExactJson([
                'success' => false,
                'message' => 'Endpoint not found.',
            ]);
    }
}
