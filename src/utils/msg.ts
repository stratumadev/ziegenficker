import { bgRed, bold, green, underline, white, yellow } from 'colorette'
export default class LogHandler {
    private getTime() {
        const now = new Date()
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`
    }

    public async errorConsoleLog(...args: any[]) {
        console.log(`${this.getTime()} ${bgRed(bold(white('ERROR')))}:`, ...args)
    }

    public async warningConsoleLog(...args: any[]) {
        console.log(`${this.getTime()} ${underline(yellow('WARN'))}:`, ...args)
    }

    public async infoConsoleLog(...args: any[]) {
        console.log(`${this.getTime()} ${underline(green('INFO'))}:`, ...args)
    }
}
