/**
 * RobotSimulator: Handles HTML5 Canvas rendering, robot state, 
 * command execution queue, and wall collision detection.
 */
export class RobotSimulator {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas with id "${canvasId}" not found.`);
        }
        this.ctx = this.canvas.getContext('2d');

        // Robot state parameters
        this.robot = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            width: 30,
            height: 40,
            angle: 0, // Orientation in degrees
            speed: 2,
            color: '#3b82f6' // Tailwind Blue
        };

        // Execution queue and state flags
        this.commandQueue = [];
        this.currentCommand = null;
        this.isExecuting = false;
        this.animationFrameId = null;

        // Bind animation loop context
        this.loop = this.loop.bind(this);
    }

    /**
     * Initialize and start the rendering loop.
     */
    init() {
        this.startLoop();
    }

    startLoop() {
        if (!this.animationFrameId) {
            this.loop();
        }
    }

    stopLoop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Main animation loop updating physics and rendering graphics.
     */
    loop() {
        this.processQueue();
        this.updatePosition();
        this.render();
        this.animationFrameId = requestAnimationFrame(this.loop);
    }

    /**
     * Add an array of block commands to the execution queue.
     * Example command format: { type: 'FORWARD', value: 100 } or { type: 'TURN', value: 90 }
     */
    enqueueCommands(commands) {
        this.commandQueue.push(...commands);
        this.isExecuting = true;
    }

    /**
     * Process commands sequentially from the queue.
     */
    processQueue() {
        if (!this.currentCommand && this.commandQueue.length > 0) {
            this.currentCommand = this.commandQueue.shift();
            this.initializeCommand(this.currentCommand);
        } else if (!this.currentCommand && this.commandQueue.length === 0) {
            this.isExecuting = false;
        }
    }

    initializeCommand(cmd) {
        // Set up target values or counters based on command type
        switch (cmd.type) {
            case 'FORWARD':
            case 'BACKWARD':
                cmd.distanceRemaining = Math.abs(cmd.value);
                cmd.direction = cmd.type === 'FORWARD' ? 1 : -1;
                break;
            case 'TURN_LEFT':
            case 'TURN_RIGHT':
                cmd.angleRemaining = Math.abs(cmd.value);
                cmd.direction = cmd.type === 'TURN_RIGHT' ? 1 : -1;
                break;
            default:
                this.currentCommand = null;
                break;
        }
    }

    /**
     * Update robot coordinates and orientation based on active commands.
     */
    updatePosition() {
        if (!this.currentCommand) return;

        const cmd = this.currentCommand;

        if (cmd.type === 'FORWARD' || cmd.type === 'BACKWARD') {
            const step = Math.min(this.robot.speed, cmd.distanceRemaining);
            const rad = (this.robot.angle * Math.PI) / 180;
            
            const nextX = this.robot.x + cmd.direction * step * Math.sin(rad);
            const nextY = this.robot.y - cmd.direction * step * Math.cos(rad);

            // Apply movement if no wall collision occurs
            if (!this.checkWallCollision(nextX, nextY)) {
                this.robot.x = nextX;
                this.robot.y = nextY;
            } else {
                // Abort command if wall hit
                this.currentCommand = null;
                return;
            }

            cmd.distanceRemaining -= step;
            if (cmd.distanceRemaining <= 0) {
                this.currentCommand = null;
            }
        } 
        else if (cmd.type === 'TURN_LEFT' || cmd.type === 'TURN_RIGHT') {
            const turnStep = Math.min(this.robot.speed * 2, cmd.angleRemaining);
            this.robot.angle += cmd.direction * turnStep;
            
            cmd.angleRemaining -= turnStep;
            if (cmd.angleRemaining <= 0) {
                this.currentCommand = null;
            }
        }
    }

    /**
     * Check if next coordinates intersect canvas walls.
     */
    checkWallCollision(x, y) {
        const halfW = this.robot.width / 2;
        const halfH = this.robot.height / 2;

        return (
            x - halfW < 0 ||
            x + halfW > this.canvas.width ||
            y - halfH < 0 ||
            y + halfH > this.canvas.height
        );
    }

    /**
     * Render the grid, obstacles, and robot on the canvas.
     */
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background grid
        this.drawGrid();

        // Draw robot
        this.ctx.save();
        this.ctx.translate(this.robot.x, this.robot.y);
        this.ctx.rotate((this.robot.angle * Math.PI) / 180);

        // Robot body
        this.ctx.fillStyle = this.robot.color;
        this.ctx.fillRect(-this.robot.width / 2, -this.robot.height / 2, this.robot.width, this.robot.height);

        // Direction indicator (front arrow/line)
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -this.robot.height / 2);
        this.ctx.lineTo(0, -this.robot.height / 2 - 10);
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawGrid() {
        this.ctx.strokeStyle = '#e5e7eb';
        this.ctx.lineWidth = 1;
        const gridSize = 40;

        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
}