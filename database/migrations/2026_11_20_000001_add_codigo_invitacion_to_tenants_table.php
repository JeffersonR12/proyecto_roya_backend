<?php

use App\Models\Tenant;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('codigo_invitacion', 12)->nullable()->unique()->after('codigo');
        });

        // Los tenants existentes reciben su codigo para que sus miembros puedan invitar.
        foreach (DB::table('tenants')->whereNull('codigo_invitacion')->pluck('id') as $id) {
            DB::table('tenants')
                ->where('id', $id)
                ->update(['codigo_invitacion' => Tenant::nuevoCodigoInvitacion()]);
        }
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropUnique(['codigo_invitacion']);
            $table->dropColumn('codigo_invitacion');
        });
    }
};
