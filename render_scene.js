var canvas;       // HTML 5 canvas var gl;           // webgl graphics context
var vPosition;    // shader variable attrib location for vertices
var vColor;       // shader variable attrib location for color
var uColor;       //  shader uniform variable for color
var uProjection;  //  shader uniform variable for projection matrix
var uModel_view;  //  shader uniform variable for model-view matrix

var thetaY = -15;  // rotation around y axis
var delta = 0;
var descending = false;
var viewMat;     // view matrix (will get to in Lab 4)


window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    shaderSetup();        // set up shaders

    Shapes.initShapes();  // create the primitive shapes

    render();              // Go draw the scene!
};
/**
 *  Load shaders, attach shaders to program, obtain handles for
 *  the attribute and uniform variables.
 * @return {undefined}
 */
function shaderSetup() {
    //  Load shaders
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // get handles for shader attribute variables.
    // We will need these in setting up buffers.
    vPosition = gl.getAttribLocation(program, "vPosition");
    vColor = gl.getAttribLocation(program, "vColor");   // we won't use vertex here
                            // colors but we keep it in for possible use later.

    // get handles for shader uniform variables:
    uColor = gl.getUniformLocation(program, "uColor");  // uniform color
    uProjection = gl.getUniformLocation(program, "uProjection"); // projection matrix
    uModel_view = gl.getUniformLocation(program, "uModel_view");  // model-view matrix
}

/**
 * Set the location and orientation of the camera. Compute
 * the view and projection matrices, and set the value of the uniform
 * shader variable for the projection matrix.
 * @return {undefined}
 */
function cameraSetup() {
      // All of this is to get the camera set properly. We will
    // learn about this in Lab 4
    thetaY += 0.5;  // increase rotation about chosen axis
    var eye = vec3(0.0, 8.0, 16.0);  // location of camera
    var at = vec3(0, 0, 0);         // what the camera is looking at
    var up = vec3(0.4, 1, 0);         // the camera's up direction
    viewMat = lookAt(eye, at, up);  // view matrix
    var axisRot = rotateY(thetaY);  // rotation matrix for rotating around the y axis
    viewMat = mult(viewMat, axisRot); // combine the view matrix with rotation matrix

    // Calculate the projection matrix
    var projMat = perspective(60, canvas.width / canvas.height, 0.1, 500.);
    // Set the value of the projection uniform variable in the shader
    gl.uniformMatrix4fv(uProjection, false, flatten(projMat)); // set projection matrix

}

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    cameraSetup();

    var stack = new MatrixStack();
    stack.multiply(viewMat);

    // Draw a cyan cube
    gl.uniformMatrix4fv(uModel_view, false, flatten(viewMat)); // set modelview transform
    gl.uniform4fv(uColor, vec4(0.0, 0.9, 0.9, 1.0));  // set color to cyan
    Shapes.drawPrimitive(Shapes.cube);    // draw cube

    // draw a non-uniformly scaled and translated black cube.
    //viewMat = mult(viewMat, translate(-2.0,0,0)); // update modelview transform
    //viewMat = mult(viewMat, scalem(1,3,1));   // update modelview transform
    //gl.uniformMatrix4fv(uModel_view, false, flatten(viewMat)); // set view transform
    //gl.uniform4fv(uColor, vec4(0.0, 0.0, 0.0, 1.0));  // set color to black
    //Shapes.drawPrimitive(Shapes.cube);  // draw cube


    stack.push();
    var intensity = 0.9;
    var totCubes = 13; //total number of rows it will create before descending
    var pause = 5; //time to stay at 0 in delta ticks
    var numCubes; //temporary variable for number of cubes in current frame
    delta = (delta + 0.2) % (totCubes*2 + pause);
    if (delta > totCubes) {
        numCubes = (2 * totCubes) - delta;
    } else {
        numCubes = delta;
    }

    for (i = 0; i<numCubes; i++) {
        stack.multiply(translate(2.5, 0, 0));
        //stack.multiply(rotateX(10*i));
        stack.multiply(rotateZ(-5));
        gl.uniformMatrix4fv(uModel_view, false, flatten(stack.top()));
        intensity -= 0.1;
        gl.uniform4fv(uColor, vec4(0.0, intensity, intensity, 1.0)); //set color to black
        Shapes.drawPrimitive(Shapes.cube);
        //stack.multiply(rotateX(-10*i));
        stack.push();
        for (j = 0; j<i; j++) {
            stack.multiply(translate(0, 0, 2.5));
            gl.uniformMatrix4fv(uModel_view, false, flatten(stack.top()));
            gl.uniform4fv(uColor, vec4(0.0, 0.0, 0.0, 1.0)); //set color to black
            Shapes.drawPrimitive(Shapes.cube);
        };
        stack.pop();
        stack.push();
        for (j = 0; j<i; j++) {
            stack.multiply(translate(0, 0, -2.5));
            gl.uniformMatrix4fv(uModel_view, false, flatten(stack.top()));
            gl.uniform4fv(uColor, vec4(0.0, 0.0, 0.0, 1.0)); //set color to black
            Shapes.drawPrimitive(Shapes.cube);
        };
        stack.pop();

    }
    stack.pop();
    stack.push();
    intensity = 0.9;
    for (i = 0; i<numCubes; i++) {
        stack.multiply(translate(-2.5, 0, 0));
        stack.multiply(rotateZ(5));
        gl.uniformMatrix4fv(uModel_view, false, flatten(stack.top()));
        intensity -= 0.1;
        gl.uniform4fv(uColor, vec4(0.0, intensity, intensity, 1.0)); //set color to black
        Shapes.drawPrimitive(Shapes.cube);
        stack.push();
        for (j = 0; j<i; j++) {
            stack.multiply(translate(0, 0, 2.5));
            gl.uniformMatrix4fv(uModel_view, false, flatten(stack.top()));
            gl.uniform4fv(uColor, vec4(0.0, 0.0, 0.0, 1.0)); //set color to black
            Shapes.drawPrimitive(Shapes.cube);
        };
        stack.pop();
        stack.push();
        for (j = 0; j<i; j++) {
            stack.multiply(translate(0, 0, -2.5));
            gl.uniformMatrix4fv(uModel_view, false, flatten(stack.top()));
            gl.uniform4fv(uColor, vec4(0.0, 0.0, 0.0, 1.0)); //set color to black
            Shapes.drawPrimitive(Shapes.cube);
        };
        stack.pop();

    }
    stack.pop();
    stack.push();
    intensity = 0.9;
    for (i = 0; i<numCubes; i++) {
        stack.multiply(translate(0, 0, 2.5));
        stack.multiply(rotateX(5));
        gl.uniformMatrix4fv(uModel_view, false, flatten(stack.top()));
        intensity -= 0.1;
        gl.uniform4fv(uColor, vec4(0.0, intensity, intensity, 1.0)); //set color to black
        Shapes.drawPrimitive(Shapes.cube);
        stack.push();
        for (j = 0; j<i; j++) {
            stack.multiply(translate(2.5, 0, 0));
            gl.uniformMatrix4fv(uModel_view, false, flatten(stack.top()));
            gl.uniform4fv(uColor, vec4(0.0, 0.0, 0.0, 1.0)); //set color to black
            Shapes.drawPrimitive(Shapes.cube);
        };
        stack.pop();
        stack.push();
        for (j = 0; j<i; j++) {
            stack.multiply(translate(-2.5, 0, 0));
            gl.uniformMatrix4fv(uModel_view, false, flatten(stack.top()));
            gl.uniform4fv(uColor, vec4(0.0, 0.0, 0.0, 1.0)); //set color to black
            Shapes.drawPrimitive(Shapes.cube);
        };
        stack.pop();

    }
    stack.pop();
    stack.push();
    intensity = 0.9;
    for (i = 0; i<numCubes; i++) {
        stack.multiply(translate(0, 0, -2.5));
        stack.multiply(rotateX(-5));
        gl.uniformMatrix4fv(uModel_view, false, flatten(stack.top()));
        intensity -= 0.1;
        gl.uniform4fv(uColor, vec4(0.0, intensity, intensity, 1.0)); //set color to black
        Shapes.drawPrimitive(Shapes.cube);
        stack.push();
        for (j = 0; j<i; j++) {
            stack.multiply(translate(2.5, 0, 0));
            gl.uniformMatrix4fv(uModel_view, false, flatten(stack.top()));
            gl.uniform4fv(uColor, vec4(0.0, 0.0, 0.0, 1.0)); //set color to black
            Shapes.drawPrimitive(Shapes.cube);
        };
        stack.pop();
        stack.push();
        for (j = 0; j<i; j++) {
            stack.multiply(translate(-2.5, 0, 0));
            gl.uniformMatrix4fv(uModel_view, false, flatten(stack.top()));
            gl.uniform4fv(uColor, vec4(0.0, 0.0, 0.0, 1.0)); //set color to black
            Shapes.drawPrimitive(Shapes.cube);
        };
        stack.pop();

    }
    stack.pop();

    requestAnimFrame(render);
}

