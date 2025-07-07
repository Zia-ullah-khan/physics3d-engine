<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Physics3D Engine - Copilot Instructions

This is a TypeScript-based 3D physics engine project for web browsers. The project follows these conventions and patterns:

## Project Structure
- `src/math/` - Mathematical utilities (Vector3D, Quaternion)
- `src/physics/` - Core physics components (RigidBody, Collision, PhysicsWorld)
- `examples/` - Usage examples and demos
- `dist/` - Built output files

## Code Style Guidelines
- Use TypeScript with strict type checking
- Follow object-oriented design patterns
- Use ES6+ features (classes, modules, arrow functions)
- Prefer composition over inheritance
- Use meaningful variable and method names
- Add JSDoc comments for public APIs

## Physics Engine Patterns
- All physics objects should extend or use RigidBody
- Colliders define shape for collision detection
- PhysicsWorld manages all simulation state
- Use Vector3D for all 3D mathematical operations
- Forces are applied per frame, not accumulated
- Integration happens in fixed timesteps

## Performance Considerations
- Avoid creating new objects in tight loops
- Use object pooling for frequently created/destroyed objects
- Prefer squared distance calculations over sqrt when possible
- Use AABB for broad-phase collision detection
- Implement spatial partitioning for large object counts

## API Design
- Public methods should be well-documented
- Use builder patterns for complex object creation
- Provide both high-level and low-level APIs
- Ensure all public APIs are type-safe
- Follow consistent naming conventions

## Testing Patterns
- Test mathematical operations with known values
- Test physics behavior with simple scenarios
- Use property-based testing for edge cases
- Mock external dependencies
- Test performance with benchmarks

## Examples and Documentation
- Provide working examples for all major features
- Include both simple and complex usage scenarios
- Document integration with popular libraries (Three.js, React)
- Show performance best practices
- Include visual demonstrations when possible
