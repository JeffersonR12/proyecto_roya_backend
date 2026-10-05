<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('catalogo_fitosanitario', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 20)->unique();
            $table->string('nombre', 120);
            $table->string('agente_causal', 180)->nullable();
            $table->string('cultivo', 100);
            $table->text('sintomas')->nullable();
            $table->text('recomendaciones')->nullable();
            $table->decimal('severidad_base', 5, 2)->nullable();
            $table->decimal('umbral_alerta', 5, 2)->nullable();
            $table->string('imagen_referencia', 255)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('catalogo_fitosanitario');
    }
};
