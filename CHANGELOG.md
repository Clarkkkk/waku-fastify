# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

# 0.1.1    (2026-01-14)


## **Bug Fixes**

* replace unstable_patchRsdwPlugin with compat version to fix browser errors ([09c8a5de](https://github.com/mcansh/remix-fastify/commit/09c8a5de94c28552c69110e99ce9c15f0fef0f58))

## **Refactor**

* enforce basePath from waku.config.ts and fix route mounting ([77930af8](https://github.com/mcansh/remix-fastify/commit/77930af800d5598482e8913e971baaf684018d95))
    
    ### **Description**
    
    - Enforce waku.config.ts basePath as single source of truth with validation
    - Prevent external Fastify prefix registration to avoid double-prefixing
    - Fix static asset mounting to `/assets/` only to prevent route conflicts
    - Isolate dev Vite cache dir to `node_modules/.vite-waku-fastify` by default
    - Merge waku.config.ts vite options into dev viteOptions
    
* use Vite runnerImport for loading waku config ([d51eea51](https://github.com/mcansh/remix-fastify/commit/d51eea51cab64a9a1949bc684b05ca9f4f00dcfa))

## **Chores**

* add dual-framework example demonstrating Waku and React Router v7 on Fastify ([a0321970](https://github.com/mcansh/remix-fastify/commit/a032197047a43498b72fe813a9ac401f9e5dc1c6))
* add build artifacts to .gitignore and document basePath usage ([1bb1aabf](https://github.com/mcansh/remix-fastify/commit/1bb1aabf7e7982f209fff548c06c2d066ad7bbcb))
* update deps ([122f5b5d](https://github.com/mcansh/remix-fastify/commit/122f5b5d906f2cfe6a33e47835c4843455b1b3eb))
* update pnpm-lock.yaml ([64880f5b](https://github.com/mcansh/remix-fastify/commit/64880f5bef729efc784aece3050fbca65176ad58))
* github actions ([c67e86cb](https://github.com/mcansh/remix-fastify/commit/c67e86cb6e32b51a378207ee38f462bfa62e5a09))
* github actions ([8f27f06f](https://github.com/mcansh/remix-fastify/commit/8f27f06fea9b9066bfbffc24a9d6cb3ac6211e85))
* github actions ([7c45303c](https://github.com/mcansh/remix-fastify/commit/7c45303cc72fd0b260457f8e0166c6d381c7ab2e))



# 0.1.0    (2025-12-29)


## **Features**

* core implementation and examples ([9694ebef](https://github.com/mcansh/remix-fastify/commit/9694ebefa193f7d0b36feab605b1243c71d83a89))

## **Refactor**

* seperate dev options and build options ([9ef15b8e](https://github.com/mcansh/remix-fastify/commit/9ef15b8e85e7c26dbbf6f7c7583380b60e602629))
    
    ### **Description**
    
    - Update README and LICENSE
    - Other minor fixes
    

## **Chores**

* github actions ([2b9cd6f7](https://github.com/mcansh/remix-fastify/commit/2b9cd6f79b14494ce2674abe41d25c3bdf472ae1))
