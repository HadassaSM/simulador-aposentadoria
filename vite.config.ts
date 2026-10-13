/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages serve o site em /<nome-do-repo>/
export default defineConfig({
  base: '/simulador-aposentadoria/',
  plugins: [react()],
  test: { environment: 'node' },
})
