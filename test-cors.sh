#!/bin/bash

# Script para verificar la configuración CORS en Vercel
# Basado en la documentación oficial: https://vercel.com/guides/how-to-enable-cors

echo "🔍 Verificando configuración CORS para https://parqueo-app-col.vercel.app..."

# Test 1: Pre-flight request for login
echo -e "\n📡 Test 1: Pre-flight request para /api/auth/login"
curl -i -X OPTIONS https://parqueo-app-col.vercel.app/api/auth/login \
  -H "Origin: https://parqueo-app-col.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization"

# Test 2: Pre-flight request for register
echo -e "\n\n📡 Test 2: Pre-flight request para /api/auth/register"
curl -i -X OPTIONS https://parqueo-app-col.vercel.app/api/auth/register \
  -H "Origin: https://parqueo-app-col.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization"

# Test 3: Simple GET request to check CORS headers
echo -e "\n\n📡 Test 3: GET request para verificar headers CORS"
curl -i https://parqueo-app-col.vercel.app/api/users/profile \
  -H "Origin: https://parqueo-app-col.vercel.app" \
  -H "Authorization: Bearer test-token"

echo -e "\n\n✅ Tests completados. Revisa que aparezcan los siguientes headers:"
echo "- Access-Control-Allow-Origin: https://parqueo-app-col.vercel.app"
echo "- Access-Control-Allow-Methods: GET, POST, OPTIONS (según el endpoint)"
echo "- Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With"
echo "- Access-Control-Allow-Credentials: true"
echo "- Access-Control-Max-Age: 86400"
