'use strict'

const commander = require('commander')
const path = require('path')
const fs = require('fs-extra')
const os = require('os')
const spawn = require('cross-spawn')
const chalk = require('chalk')
const execSync = require('child_process').execSync

const project = require('../package.json')

let projectName

const program = new commander.Command(project.name)
  .version(project.version, '-v, --version', 'output the current version')
  .arguments('<project-name>')
  .usage(`${chalk.green('<project-name>')}`)
  .action(function(name) {
    projectName = name
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
  husky: {
    hooks: {
      'pre-commit': 'pretty-quick --staged',
    },
  },
}

fs.mkdirSync(projectName)
fs.writeFileSync(
  path.join(root, 'package.json'),
  JSON.stringify(packageJson, null, 2) + os.EOL,
)

const devDependencies = [
  '@types/jest',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/parser',
  'eslint',
  'eslint-config-prettier',
  'eslint-plugin-jest',
  'husky',
  'jest',
  'prettier',
  'pretty-quick',
  'ts-jest',
  'typescript',
]

let command
let args = []

try {
  execSync('yarn -v', { stdio: 'ignore' })
  command = 'yarn'
  args = args.concat(['--cwd', root, 'add'])
} catch {
  command = 'npm'
  args = args.concat(['--prefix', root, 'install'])
}

const commandOptions = ['-D', '-E']
args = args.concat(devDependencies, commandOptions)

spawn.sync(command, args, { stdio: 'inherit' })

const templateDir = path.join(__dirname + '/template')
fs.copySync(templateDir, root)
