<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('analyses', function (Blueprint $table) {
            $table->string('image_path')->nullable()->after('image_base64');
            $table->longText('image_base64')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('analyses', function (Blueprint $table) {
            $table->longText('image_base64')->nullable(false)->change();
            $table->dropColumn('image_path');
        });
    }
};
