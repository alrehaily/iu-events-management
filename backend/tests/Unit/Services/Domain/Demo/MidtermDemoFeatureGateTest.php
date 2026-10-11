<?php

namespace Tests\Unit\Services\Domain\Demo;

use HiEvents\Http\Actions\Events\CreateEventAction;
use HiEvents\Http\Actions\Events\GetEventsPublicAction;
use HiEvents\Http\Actions\Orders\Public\CreateOrderActionPublic;
use HiEvents\Http\Actions\Products\CreateProductAction;
use HiEvents\Http\Actions\Reports\GetReportAction;
use HiEvents\Http\Middleware\DemoFeatureGateMiddleware;
use HiEvents\Services\Domain\Demo\MidtermDemoFeatureGate;
use Illuminate\Http\Request;
use Illuminate\Routing\Route;
use Symfony\Component\HttpFoundation\Response;
use Tests\TestCase;

class MidtermDemoFeatureGateTest extends TestCase
{
    public function test_blocks_disabled_action(): void
    {
        $request = Request::create('/api/public/events/1/order', 'POST');
        $route = new Route('POST', '/api/public/events/{event_id}/order', [
            'controller' => CreateOrderActionPublic::class,
        ]);
        $request->setRouteResolver(fn () => $route);

        $this->assertTrue(MidtermDemoFeatureGate::isRequestBlocked($request));
    }

    public function test_blocks_disabled_uri_pattern(): void
    {
        $request = Request::create('/api/public/check-in-lists/abc', 'GET');

        $this->assertTrue(MidtermDemoFeatureGate::isRequestBlocked($request));
    }

    public function test_allows_enabled_public_events(): void
    {
        $request = Request::create('/api/public/events', 'GET');
        $route = new Route('GET', '/api/public/events', [
            'controller' => GetEventsPublicAction::class,
        ]);
        $request->setRouteResolver(fn () => $route);

        $this->assertFalse(MidtermDemoFeatureGate::isRequestBlocked($request));
    }

    public function test_allows_enabled_event_creation(): void
    {
        $request = Request::create('/api/events', 'POST');
        $route = new Route('POST', '/api/events', [
            'controller' => CreateEventAction::class,
        ]);
        $request->setRouteResolver(fn () => $route);

        $this->assertFalse(MidtermDemoFeatureGate::isRequestBlocked($request));
    }

    public function test_allows_products_and_tickets(): void
    {
        $request = Request::create('/api/events/1/products', 'POST');
        $route = new Route('POST', '/api/events/{event_id}/products', [
            'controller' => CreateProductAction::class,
        ]);
        $request->setRouteResolver(fn () => $route);

        $this->assertFalse(MidtermDemoFeatureGate::isRequestBlocked($request));
    }

    public function test_middleware_returns_404_for_blocked_request(): void
    {
        $request = Request::create('/api/events/1/reports/sales', 'GET');
        $route = new Route('GET', '/api/events/{event_id}/reports/{report_type}', [
            'controller' => GetReportAction::class,
        ]);
        $request->setRouteResolver(fn () => $route);

        $middleware = new DemoFeatureGateMiddleware();
        $response = $middleware->handle($request, fn () => new Response());

        $this->assertSame(Response::HTTP_NOT_FOUND, $response->getStatusCode());
        $data = json_decode($response->getContent(), true);
        $this->assertSame('Not Found', $data['message']);
    }

    public function test_middleware_passes_allowed_request(): void
    {
        $request = Request::create('/api/public/events', 'GET');
        $route = new Route('GET', '/api/public/events', [
            'controller' => GetEventsPublicAction::class,
        ]);
        $request->setRouteResolver(fn () => $route);

        $middleware = new DemoFeatureGateMiddleware();
        $executed = false;
        $response = $middleware->handle($request, function () use (&$executed) {
            $executed = true;
            return new Response('ok', Response::HTTP_OK);
        });

        $this->assertTrue($executed);
        $this->assertSame(Response::HTTP_OK, $response->getStatusCode());
    }
}
