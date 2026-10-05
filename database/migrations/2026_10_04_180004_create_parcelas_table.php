<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parcelas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->restrictOnDelete();
            $table->foreignId('usuario_id')->constrained('users')->restrictOnDelete();
            $table->string('nombre', 100);
            $table->decimal('latitud', 10, 7)->nullable();
            $table->decimal('longitud', 10, 7)->nullable();
            $table->decimal('area_hectareas', 8, 2)->nullable();
            $table->string('cultivo', 100)->default('trigo');
            $table->timestamps();

            $table->index(['tenant_id', 'usuario_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parcelas');
    }
};
