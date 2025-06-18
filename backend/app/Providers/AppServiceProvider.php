<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Validator;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Validator::extend('confirmed_custom', function ($attribute, $value, $parameters, $validator) {
            $confirmField = $parameters[0] ?? $attribute.'_confirmation';
            return $validator->getData()[$confirmField] === $value;
        });
        
        // Or override the built-in 'confirmed' rule
        Validator::extendImplicit('confirmed', function ($attribute, $value, $parameters, $validator) {
            // Look for confirmPassword instead of password_confirmation
            if ($attribute === 'password') {
                return $validator->getData()['confirmPassword'] === $value;
            }
            
            // Default Laravel behavior for other fields
            return $validator->getData()[$attribute.'_confirmation'] === $value;
        });
    }
}
