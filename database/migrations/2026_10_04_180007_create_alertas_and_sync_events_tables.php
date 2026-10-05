<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alertas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->restrictOnDelete();
            $table->foreignId('diagnostico_id')->constrained('diagnosticos')->restrictOnDelete();
            $table->foreignId('usuario_id')->constrained('users')->restrictOnDelete();
            $table->string('tipo', 30);
            $table->text('mensaje');
            $table->boolean('leida')->default(false);
            $table->timestamps();

            $table->index(['tenant_id', 'leida']);
        });

        Schema::create('sync_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained('tenants')->nullOnDelete();
            $table->uuid('uuid_local')->index();
            $table->string('estado', 20);
            $table->unsignedInteger('intentos')->default(0);
            $table->text('ultimo_error')->nullable();
            $table->timestamps();

            $table->index(['uuid_local', 'estado']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sync_events');
        Schema::dropIfExists('alertas');
    }
};
