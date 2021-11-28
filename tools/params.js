import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

export const argv = yargs(hideBin(process.argv))
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    default: false,
    description: 'Affiche les logs du serveur'
  })
  .help()
  .argv

export default argv
