<?php

namespace Tests\Unit;

use App\Support\Risk;
use PHPUnit\Framework\TestCase;

class RiskTest extends TestCase
{
    public function test_confidence_uses_a_single_scale(): void
    {
        $this->assertSame('critical', Risk::level(0.31));
        $this->assertSame('medium', Risk::level(0.3));
        $this->assertSame('medium', Risk::level(0.1));
        $this->assertSame('healthy', Risk::level(0.09));
        $this->assertSame('CRITICO', Risk::present(0.36)['label']);
        $this->assertSame(36, Risk::present(0.36)['severity']);
    }
}
