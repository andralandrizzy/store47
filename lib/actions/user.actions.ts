'use server';

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { SignInFormSchema, SignUpFormSchema } from "../validators";
import { signIn, signOut } from "@/auth";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";


// Sign in the user with credentials
export async function signInWithCredentials(prevState: unknown,
    formData: FormData) {
    try {
        const user = SignInFormSchema.parse({
            email: formData.get('email'),
            password: formData.get('password')
        });
        await signIn('credentials', user);
        return { success: true, message: 'Signed In Successfully!' }
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }

        return { success: false, message: 'Invalid email or password' }
    }
}


//Sign user out
export async function signOutUser() {
    await signOut();
}


export async function signUpUser(prevState: unknown, formData: FormData) {
    try {
        const user = SignUpFormSchema.parse({
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
        });

        const plainPassword = user.password;
        user.password = hashSync(user.password, 10);

        await prisma.user.create({
            data: {
                name: user.name,
                email: user.email,
                password: user.password,
            },
        });
        await signIn('credentials', {
            email: user.email,
            password: plainPassword,
        });
        return { success: true, message: 'User Registered Successfully!' }
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }

        return { success: false, message: 'User was not registered' }
    }
}