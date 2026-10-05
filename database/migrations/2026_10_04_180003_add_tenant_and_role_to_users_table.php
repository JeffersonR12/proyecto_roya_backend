<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('tenant_id')->nullable()->after('id')->constrained('tenants')->restrictOnDelete();
            $table->foreignId('rol_id')->nullable()->after('tenant_id')->constrained('roles')->restrictOnDelete();
            $table->boolean('activo')->default(true)->after('rol_id');
            $table->dropUnique(['email']);
            $table->unique(['tenant_id', 'email']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['tenant_id', 'email']);
            $table->unique('email');
            $table->dropConstrainedForeignId('rol_id');
            $table->dropConstrainedForeignId('tenant_id');
            $table->dropColumn('activo');
        });
    }
};
