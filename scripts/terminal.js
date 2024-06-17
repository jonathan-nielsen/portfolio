class Terminal {
	constructor() {
		this.terminal = document.getElementById('terminal')
		this.terminalOutput = document.getElementById('terminal-body-content')
		this.terminalInput = document.getElementById('terminal-input')
		this.terminalCaret = document.getElementById('terminal-caret')
		this.terminalInput.focus()
		this.history = []
		this.historyIndex = 0
		this.commands = {}
		this.currentDirectory = '/home/user/'
		this.originalState = this.terminalOutput.innerHTML
	}

	init() {
		this.terminal.addEventListener('click', () => this.terminalInput.focus())
		this.terminalInput.addEventListener('keydown', this.handleInput.bind(this))
		this.setCommandHandler('help', this.printHelp.bind(this))
		this.setCommandHandler('clear', this.clear.bind(this))
		this.setCommandHandler('echo', this.echo.bind(this))
		this.setCommandHandler('ls', this.ls.bind(this))
		this.setCommandHandler('cd', this.cd.bind(this))
		this.setCommandHandler('cat', this.cat.bind(this))
		this.setCommandHandler('pwd', this.pwd.bind(this))
		this.setCommandHandler('whoami', this.whoami.bind(this))
		this.setCommandHandler('date', this.date.bind(this))
		this.setCommandHandler('reset', this.reset.bind(this))
		this.setCommandHandler('exit', this.exit.bind(this))
	}

	handleInput(event) {
		let newInputValue = event.key.length === 1 ? this.terminalInput.value + event.key : this.terminalInput.value

		if (event.key === 'Enter') {
			event.preventDefault()

			const currentLine = this.terminalInput.parentElement

			if (!newInputValue.length) {
				this.addPrompt()
				return
			}

			const command = newInputValue.trim()
			this.history.push(command)
			this.historyIndex = this.history.length
			this.terminalInput.value = ''
			this.terminalCaret.style.right = ''
			newInputValue = ''
			this.executeCommand(command)

			if (command !== 'reset') {
				this.addPrompt()
			}

			currentLine.innerHTML = command
		} else if (event.key === 'ArrowUp') {
			event.preventDefault()
			if (this.historyIndex > 0) {
				this.historyIndex--
				this.terminalInput.value = this.history[this.historyIndex]
				newInputValue = this.terminalInput.value
			}
		} else if (event.key === 'ArrowDown') {
			event.preventDefault()
			if (this.historyIndex < this.history.length - 1) {
				this.historyIndex++
				this.terminalInput.value = this.history[this.historyIndex]
				newInputValue = this.terminalInput.value
			} else {
				this.historyIndex = this.history.length
				this.terminalInput.value = ''
				newInputValue = ''
			}
		} else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
			let caretPosition = this.terminalInput.selectionStart

			if (event.key === 'ArrowLeft') {
				caretPosition--
			} else {
				caretPosition++
			}

			if (caretPosition < 0) {
				caretPosition = 0
			} else if (caretPosition > this.terminalInput.value.length) {
				caretPosition = this.terminalInput.value.length
			} else {
				this.terminalCaret.style.right = `calc(${this.terminalInput.value.length - (caretPosition + 1)}ch - 1px)`
			}
			return
		} else if (event.key === 'Delete') {
			let caretPosition = this.terminalInput.selectionStart

			this.terminalInput.style.width = `${this.terminalInput.value.length}ch`
			this.terminalCaret.style.right = `calc(${this.terminalInput.value.length - (caretPosition + 1)}ch - 1px)`
			return
		} else if (event.key === 'Backspace') {
			this.terminalInput.style.width = `${this.terminalInput.value.length - 1}ch`
			return
		} else if (event.ctrlKey && event.key === 'c') {
			event.preventDefault()
			const value = this.terminalInput.value.trim()
			this.terminalInput.value = ''
			this.terminalInput.style.width = '2ch'
			this.terminalInput.parentElement.innerHTML = `${value}^C`
			this.terminalInput.style.width = '0ch'
			this.historyIndex = this.history.length
			this.terminalCaret.style.right = ''

			this.addPrompt()

			return
		}

		if (newInputValue.length) {
			this.terminalInput.style.width = `${newInputValue.length}ch`
		} else {
			this.terminalInput.style.width = '0ch'
		}
	}

	executeCommand(command) {
		const [commandName, ...args] = command.split(' ')
		if (commandName in this.commands) {
			this.commands[commandName](args)
		} else {
			this.printOutput(`bash: ${commandName}: command not found, try 'help'`)
		}
	}

	printOutput(output) {
		const divLine = document.createElement('div')
		divLine.classList.add('terminal-body-content-line')

		// Add div inside divLine
		const spanLineText = document.createElement('span')
		spanLineText.classList.add('terminal-body-content-line-text')
		spanLineText.innerHTML = output

		divLine.appendChild(spanLineText)

		this.terminalOutput.appendChild(divLine)
	}

	addPrompt() {
		const divLine = document.createElement('div')
		divLine.classList.add('terminal-body-content-line')

		// Add prefix inside divLine
		const spanLinePrefix = document.createElement('span')
		spanLinePrefix.classList.add('terminal-body-content-line-prefix')

		divLine.appendChild(spanLinePrefix)

		// Add username inside divPrefix
		const spanLinePrefixUsername = document.createElement('span')
		spanLinePrefixUsername.classList.add('terminal-body-content-line-prefix-username')
		spanLinePrefixUsername.textContent = 'user@localhost'

		spanLinePrefix.appendChild(spanLinePrefixUsername)

		spanLinePrefix.innerHTML += ':'

		// // Add path inside divPrefix
		const spanLinePrefixPath = document.createElement('span')
		spanLinePrefixPath.classList.add('terminal-body-content-line-prefix-path')
		spanLinePrefixPath.textContent = this.getCurrentDirectory()

		spanLinePrefix.appendChild(spanLinePrefixPath)

		spanLinePrefix.innerHTML += ' $ '

		// Add input inside divLine
		const spanLineText = document.createElement('span')
		spanLineText.classList.add('terminal-body-content-line-text')

		divLine.appendChild(spanLineText)

		// Add a new line after the output
		this.terminalOutput.appendChild(divLine)

		// Move the entire caret and input alement inside spanLineText
		spanLineText.appendChild(this.terminalInput)
		spanLineText.appendChild(this.terminalCaret)

		// Focus the input element
		this.terminalInput.focus()
	}

	// printWelcomeMessage() {
	//     this.printOutput('Welcome to my portfolio terminal!')
	// }

	getCurrentDirectory() {
		return this.currentDirectory.replace(/\/home\/user/, '~')
	}

	printHelp() {
		this.printOutput('Available commands:')
		this.printOutput('help - display this help message')
		this.printOutput('clear - clear the terminal screen')
		this.printOutput('echo [text] - print text to the terminal')
		this.printOutput('ls - list files and directories')
		this.printOutput('cd [directory] - change directory')
		this.printOutput('cat [file] - display file contents')
		this.printOutput('pwd - print the current working directory')
		this.printOutput('whoami - print the current user')
		this.printOutput('date - print the current date and time')
		this.printOutput('exit - close the terminal and return to the frontend')
	}

	clear() {
		// Remove all children of terminalOutput except the last one.
		// Reset the input value and width.
		this.terminalOutput.innerHTML = ''
		this.terminalInput.value = ''
		this.terminalInput.style.width = '0ch'
	}

	echo(args) {
		this.printOutput(args.join(' '))
	}

	ls(args) {
		let newLine = false
		let trailingFolderSlash = false
		let humanReadable = false

		const items = [{
			type: 'directory',
			name: 'media',
		}, {
			type: 'directory',
			name: 'scripts',
		}, {
			type: 'directory',
			name: 'styles',
		}, {
			type: 'file',
			name: 'backend.html',
		}, {
			type: 'file',
			name: 'index.html',
		}, {
			type: 'file',
			name: 'package.json',
		}, {
			type: 'file',
			name: 'README.md',
		}]

		const sortedItems = items.sort((a, b) => {
			if (a.name < b.name) {
				return -1
			}
		})

		if (args.length && args[0][0] === '-') {
			const allowedFlags = ['a', 'l', 'F', 'h']
			const flags = args[0].slice(1)

			for (const flag of flags) {
				if (!allowedFlags.includes(flag)) {
					this.printOutput(`ls: invalid option -- '${flag}'`)
					this.printOutput('Try \'ls --help\' for more information.')
					return
				}

				if (flag === 'a') {
					items.push({
						type: 'directory',
						name: '.',
					}, {
						type: 'directory',
						name: '..',
					})
				}

				if (flag === 'l') {
					newLine = true
				}

				if (flag === 'F') {
					trailingFolderSlash = true
				}

				if (flag === 'h') {
					humanReadable = true
				}
			}
		}

		const itemString = sortedItems.map(item => {
			const span = document.createElement('span')
			span.textContent = item.name
			const isDirectory = item.type === 'directory'
			
			if (isDirectory) {
				span.classList.add('blue')
			} else {
				span.classList.add('white')
			}

			let newLinePrefix = ''

			if (newLine) {
				const permission = `${item.type === 'file' ? '-' : 'd'}r--r--r--`

				const date = new Date()
				const month3Letter = date.toLocaleString('default', { month: 'short' })
				const folderSize = humanReadable ? '4.0K' : 4096
				const randomFileSize = Math.floor(Math.random() * 2048) + 100
				const randomFileSizeHumanReadable = Math.floor(Math.random() * 9) + 1
				const fileSize = humanReadable ? `${(randomFileSizeHumanReadable).toFixed(1)}K` : randomFileSize.toString().length === 3 ? `&nbsp;${randomFileSize}` : `${randomFileSize}`

				newLinePrefix = `${permission}  1 user user ${isDirectory ? folderSize : fileSize} ${month3Letter} ${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} `
			}

			if (trailingFolderSlash && isDirectory) {
				return `${newLinePrefix}${span.outerHTML}/`
			} else {
				return `${newLinePrefix}${span.outerHTML}`
			}
		})

		if (newLine) {
			for (const item of itemString) {
				this.printOutput(item)
			}
		} else {
			this.printOutput(itemString.join(' '))
		}
	}

	cd() {
		this.printOutput('cd: command not implemented yet')
	}

	cat() {
		this.printOutput('cat: command not implemented yet')
	}

	pwd() {
		this.printOutput(this.currentDirectory)
	}

	whoami() {
		this.printOutput('I don\'t know who you are, but this was made by Jonathan Nielsen')
	}

	date() {
		const date = new Date()
		this.printOutput(date.toString())
	}

	reset() {
		this.terminalOutput.innerHTML = this.originalState
		this.terminal = document.getElementById('terminal')
		this.terminalOutput = document.getElementById('terminal-body-content')
		this.terminalInput = document.getElementById('terminal-input')
		this.terminalCaret = document.getElementById('terminal-caret')
		this.terminalInput.focus()
		this.currentDirectory = '/home/user/'
		this.originalState = this.terminalOutput.innerHTML
		this.terminalInput.value = ''
		this.terminalInput.style.width = '0ch'
		this.init()
	}

	exit() {
		// Navigate to the home page
		window.location.href = 'index.html'
	}

	focus() {
		this.terminalInput.focus()
	}

	setCommandHandler(command, handler) {
		this.commands[command] = handler
	}
}

function main() {
	const terminal = new Terminal()
	terminal.init()
	// terminal.printWelcomeMessage()
	// terminal.printHelp()
	terminal.focus()
}


document.addEventListener('DOMContentLoaded', main)