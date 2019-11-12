'use strict'

const commander = require('commander')
const path = require('path')
const fs = require('fs')
const os = require('os')
const spawn = require('cross-spawn')
const chalk = require('chalk')

const project = require('../package.json')

let projectName

const program = new commander.Command(project.name)
  .version(project.version, '-v, --version', 'output the current version')
  .arguments('<project-name>')
  .usage(`${chalk.green('<project-name>')}`)
  .action(function(name) {
    projectName = name
  })
  .on('end', function() {
    console.log('Success:')
    console.log(`  cd ${chalk.green(project.name)}`)
    console.log(`  yarn test`)
    console.log()
  })

program.parse(process.argv)

if (typeof projectName === 'undefined') {
  console.log('Please enter project name:')
  console.log(`  Usage: ${project.name} ${chalk.green('<project-name>')}`)
  console.log()
  process.exit(1)
}

const root = path.resolve(projectName)
const appName = path.basename(root)

const packageJson = {
  name: appName,
  version: '0.1.0',
  private: true,
  scripts: {
    build: 'tsc',
    test: 'jest',
  },
}

fs.mkdirSync(projectName)
fs.writeFileSync(
  path.join(root, 'package.json'),
  JSON.stringify(packageJson, null, 2) + os.EOL,
)

const devDependencies = [
  '@types/jest',
  'jest',
  'prettier',
  'tslint',
  'tslint-config-prettier',
  'ts-jest',
  'typescript',
]

let args = ['add', '-D', '-E']
args = args.concat(devDependencies)
args.push('--cwd')
args.push(root)

spawn.sync('yarn', args, { stdio: 'inherit' })
spawn.sync('./node_modules/.bin/tsc', ['--init'], { stdio: 'inherit' })

fs.mkdirSync(`${projectName}/src`)
fs.writeFileSync(
  path.join(root, 'src/index.ts'),
  `const greeting: string = 'Hello World'`,
)

fs.mkdirSync(`${projectName}/test`)
fs.writeFileSync(
  path.join(root, 'test/index.test.ts'),
  `it('example', () => {})`,
)

const prettierrc = {
  trailingComma: 'all',
  semi: false,
  singleQuote: true,
}

fs.writeFileSync(
  path.join(root, '.prettierrc'),
  JSON.stringify(prettierrc, null, 2) + os.EOL,
)

const tslint = {
  defaultSeverity: 'error',
  extends: ['tslint:recommended', 'tslint-config-prettier'],
  jsRules: {},
  rules: {},
  rulesDirectory: [],
}

fs.writeFileSync(
  path.join(root, 'tslint.json'),
  JSON.stringify(tslint, null, 2) + os.EOL,
)

const jestConfig = `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
}
`

fs.writeFileSync(path.join(root, 'jest.config.js'), jestConfig)

const tsConfig = {
  compilerOptions: {
    declaration: true,
    lib: ['es6'],
    module: 'commonjs',
    outDir: './dist',
    strict: true,
    target: 'es5',
  },
  include: ['src/**/*'],
}

fs.writeFileSync(
  path.join(root, 'tsconfig.json'),
  JSON.stringify(tsConfig, null, 2) + os.EOL,
)

const gitignore = `# Created by https://www.gitignore.io/api/node
# Edit at https://www.gitignore.io/?templates=node

### Node ###
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Diagnostic reports (https://nodejs.org/api/report.html)
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
node_modules/
jspm_packages/

# TypeScript v1 declaration files
typings/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# react / gatsby 
public/

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# End of https://www.gitignore.io/api/node

dist
`

fs.writeFileSync(path.join(root, '.gitignore'), gitignore + os.EOL)
