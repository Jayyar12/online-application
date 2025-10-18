<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('answers', function (Blueprint $table) {
            $table->foreignId('quiz_attempt_id')
                ->after('id')
                ->constrained('quiz_attempts')
                ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('answers', function (Blueprint $table) {
            $table->dropForeign(['quiz_attempt_id']);
            $table->dropColumn('quiz_attempt_id');
        });
    }
};
