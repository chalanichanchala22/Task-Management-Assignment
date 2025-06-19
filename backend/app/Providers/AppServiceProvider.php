<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Schema;
use Illuminate\Pagination\Paginator;

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
        // Fix for MySQL < 5.7.7 and MariaDB < 10.2.2
        Schema::defaultStringLength(191);
        
        // Use Bootstrap for pagination
        Paginator::useBootstrap();
        
        // Custom validator for password confirmation with "confirmPassword" field
        Validator::extend('confirmed_with', function ($attribute, $value, $parameters, $validator) {
            $confirmField = $parameters[0] ?? $attribute.'_confirmation';
            $data = $validator->getData();
            return isset($data[$confirmField]) && $data[$confirmField] === $value;
        }, 'The :attribute confirmation does not match.');
        
        // Extend the built-in 'confirmed' rule to support alternative field names
        Validator::extendImplicit('confirmed', function ($attribute, $value, $parameters, $validator) {
            $data = $validator->getData();
            
            // First check standard Laravel confirmation field
            $standardField = $attribute.'_confirmation';
            if (isset($data[$standardField]) && $data[$standardField] === $value) {
                return true;
            }
            
            // Then check alternative field names
            $alternativeFields = [
                'password' => ['confirmPassword', 'password_confirm', 'confirm_password'],
                'email' => ['confirmEmail', 'email_confirm', 'confirm_email'],
            ];
            
            if (isset($alternativeFields[$attribute])) {
                foreach ($alternativeFields[$attribute] as $field) {
                    if (isset($data[$field]) && $data[$field] === $value) {
                        return true;
                    }
                }
            }
            
            return false;
        }, 'The :attribute confirmation does not match.');
        
        // Add a validation rule to check password strength
        Validator::extend('strong_password', function ($attribute, $value, $parameters, $validator) {
            // Minimum 8 characters
            if (strlen($value) < 8) {
                return false;
            }
            
            // Check for at least one uppercase letter
            if (!preg_match('/[A-Z]/', $value)) {
                return false;
            }
            
            // Check for at least one lowercase letter
            if (!preg_match('/[a-z]/', $value)) {
                return false;
            }
            
            // Check for at least one number
            if (!preg_match('/[0-9]/', $value)) {
                return false;
            }
            
            // Check for at least one special character
            if (!preg_match('/[^A-Za-z0-9]/', $value)) {
                return false;
            }
            
            return true;
        }, 'The :attribute must be at least 8 characters and include uppercase, lowercase, number, and special character.');
    }
}
