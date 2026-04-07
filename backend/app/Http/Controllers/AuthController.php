<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\RegistrationWelcomeMail;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:6',
            ], [
                'email.unique' => 'Email sudah terdaftar, silakan login atau gunakan email lain.',
                'email.email'  => 'Format email tidak valid.',
                'name.required' => 'Nama wajib diisi.',
                'password.min' => 'Password minimal 6 karakter.'
            ]);
            
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'is_admin' => false,
            ]);
            
            $token = $user->createToken('api-token')->plainTextToken;

            // Send welcome email (non-blocking best-effort)
            try {
                if (!empty($user->email)) {
                    $mailable = new RegistrationWelcomeMail($user->name);
                    Mail::to($user->email)->send($mailable);
                    \App\Services\EmailLogger::sent(
                        $user->email,
                        'Selamat Datang di HRSHOPKU',
                        'emails.registration_welcome',
                        ['name' => $user->name]
                    );
                }
            } catch (\Exception $mailEx) {
                // Log silently; don't fail registration
                Log::warning('Welcome mail failed: '.$mailEx->getMessage());
                if (!empty($user->email)) {
                    \App\Services\EmailLogger::failed(
                        $user->email,
                        'Selamat Datang di HRSHOPKU',
                        'emails.registration_welcome',
                        ['name' => $user->name],
                        $mailEx->getMessage()
                    );
                }
            }
            return response()->json(['user'=>$user,'token'=>$token], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            $errors = $e->errors();
            // Flatten first message for convenience on the client
            $firstMsg = 'Validasi gagal.';
            foreach ($errors as $field => $messages) {
                if (is_array($messages) && count($messages) > 0) {
                    $firstMsg = $messages[0];
                    break;
                }
            }
            return response()->json([
                'error' => 'Validation failed',
                'message' => $firstMsg,
                'errors' => $errors,
            ], 422);
        } catch (\Exception $e) {
            return response()->json(['error'=>'Registration failed','message'=>$e->getMessage()], 500);
        }
    }

    #public function login(Request $request)
    #{
    #    $creds = $request->only(['email','password']);
    #    $user = User::where('email', $creds['email'])->first();
    #    if (!$user || !Hash::check($creds['password'], $user->password)){
    #        return response()->json(['error'=>'invalid credentials'],401);
    #    }
    #    $token = $user->createToken('api-token')->plainTextToken;
    #    return response()->json(['user'=>$user,'token'=>$token]);
    #}

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        $email = trim($request->email);
        $password = trim($request->password);

        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return response()->json(['error'=>'invalid credentials'],401);
        }

        $token = $user->createToken('api-token')->plainTextToken;
        return response()->json(['user'=>$user,'token'=>$token]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['logged_out'=>true]);
    }
}
