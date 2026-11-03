<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Ambang Batas Margin HPP (UntungJelas)
    |--------------------------------------------------------------------------
    | Sesuai spesifikasi docs/BRIEF.md:
    | - rugi: margin < 0
    | - tipis: 0 <= margin < 20
    | - sehat: margin >= 20
    */
    'thresholds' => [
        'sehat' => 20.0,
        'tipis' => 0.0,
    ],
];
