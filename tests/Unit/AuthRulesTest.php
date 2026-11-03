<?php

namespace Tests\Unit;

use App\Support\AuthRules;
use PHPUnit\Framework\TestCase;

class AuthRulesTest extends TestCase
{
    public function test_login_policy_constants_match_security_rules(): void
    {
        $this->assertSame(5, AuthRules::LOGIN_ATTEMPTS);
        $this->assertSame(60, AuthRules::LOGIN_DECAY_SECONDS);
        $this->assertSame(43200, AuthRules::REMEMBER_MINUTES);
        $this->assertSame(30, (int) (AuthRules::REMEMBER_MINUTES / 1440));
        $this->assertMatchesRegularExpression(AuthRules::GMAIL_PATTERN, 'qa.ok@gmail.com');
        $this->assertDoesNotMatchRegularExpression(AuthRules::GMAIL_PATTERN, 'qa.ok@hotmail.com');
        $this->assertDoesNotMatchRegularExpression(AuthRules::GMAIL_PATTERN, 'qa.ok@gmail.com.ar');
    }

    public function test_peruvian_mobile_must_use_country_code_and_nine_digits(): void
    {
        $this->assertSame('+51987654321', AuthRules::normalizePeruPhone('987 654 321'));
        $this->assertSame('+51987654321', AuthRules::normalizePeruPhone('+51 987654321'));
        $this->assertMatchesRegularExpression(AuthRules::PERU_PHONE_PATTERN, '+51987654321');
        $this->assertDoesNotMatchRegularExpression(AuthRules::PERU_PHONE_PATTERN, '+51123456789');
        $this->assertDoesNotMatchRegularExpression(AuthRules::PERU_PHONE_PATTERN, '+15551234567');
        $this->assertDoesNotMatchRegularExpression(AuthRules::PERU_PHONE_PATTERN, AuthRules::normalizePeruPhone('123456789'));
    }
}
