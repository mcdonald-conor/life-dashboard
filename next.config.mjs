let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['bcrypt'],
    outputFileTracingExcludes: {
      '*': [
        'node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt/src/**',
        'node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt/binding.gyp',
        'node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt/build/**',
      ],
    },
    outputFileTracingIncludes: {
      '*': [
        'node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt/lib/binding/**',
      ],
    },
  },
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig
