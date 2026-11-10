<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->unique()->after('phone');
            $table->string('google_id')->nullable()->unique()->after('email');
            $table->string('phone')->nullable()->change();
            $table->string('password')->nullable()->change();
            $table->string('business_name')->nullable()->change();
            $table->string('business_type')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['email', 'google_id']);
        });
    }
};

