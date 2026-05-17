<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    public static function getPlatformCut()
    {
        // Fetches the '5' from your database and converts it to a mathematical number
        $cut = self::where('key', 'platform_fee_percentage')->value('value');

        return $cut ? (float) $cut : 0;
    }
}
