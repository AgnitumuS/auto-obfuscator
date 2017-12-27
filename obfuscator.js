const js_obs = require('javascript-obfuscator');
const css_obs = require('clean-css');
var htmlminifier = require('html-minifier');
var lzstring = require('lz-string');
const fs = require('fs');
const path = require('path')

const DIR_TO_OBFUSCATE = __dirname + '/../ToObfuscate/';

let recursing = 0;
let count = 0;

const BLACKLISTED = {'load': true, 'spawn-menu': true, 'draw-circle': true, 'ctools': true, 'keypress': true, 'warpgui': true}

const interval = setInterval(function() 
{
    if (recursing == 0 && count > 0)
    {
        console.log(`********************************************************`);
        console.log(`Successfully processed ${count} files.`);
        console.log(`********************************************************`);
        clearInterval(interval);
    }
}, 1500);

ReadDirectory(DIR_TO_OBFUSCATE);


function ReadDirectory(path)
{
    console.log(`Opening ${path.replace(__dirname, '')}`);

    let new_dir = path.replace('ToObfuscate', 'Obfuscated');

    let package_name = path.replace(__dirname + '/../ToObfuscate/', '');
    package_name = package_name.substring(0, package_name.indexOf('/'));

    if (!fs.existsSync(new_dir))
    {
        fs.mkdir(new_dir);
    }

    console.log(`Package: ${package_name}`);
    
    fs.readdir(path, function(err, filenames)
    {
        if (err) throw err;
        filenames.forEach(function(filename) 
        {
            // If it's a directory
            if (fs.lstatSync(path + filename).isDirectory())
            {
                ReadDirectory(path + filename + '/');
            }
            else // Otherwise it's a file, so we should do something with it
            {
                fs.readFile(path + filename, 'utf8', function (err, data)
                {
                    recursing++;
                    let end_result = data; // End result, whether it is obfuscated or not

                    if (path.includes('client_package')) // It's a client file, so we should obfuscate it
                    {
                        if (filename.indexOf('.js') > -1 && filename.indexOf('.json') == -1 && !filename.includes('jquery'))
                        {
                            const obfuscationResult = js_obs.obfuscate(data, 
                            {
                                compact: false,
                                controlFlowFlattening: true,
                                debugProtection: true,
                                disableConsoleOutput: true,
                                selfDefending: true
                            });

                            end_result = obfuscationResult.getObfuscatedCode();
                        }
                        else if (filename.indexOf('.html') > -1 && !path.includes('handbook/')) // Obfuscate HTML
                        {
                            end_result = packhtml(end_result);
                        }
                        else if (filename.indexOf('.css') > -1 && filename.indexOf('awesome') == -1) // Minify CSS
                        {
                            end_result = new css_obs({level: 0}).minify(end_result).styles;
                        }

                        // By this point the file has been obfuscated if it needs to be

                        fs.writeFile(new_dir + filename, end_result, {flag : 'w'}, (err) => {
                            if (err) throw err;
                        
                            console.log(`FILE: ${package_name}/${filename} successfully obfuscated and put in /Obfuscated.`);
                            count++;
                            recursing--;
                        }); 
                    }
                    else // This isn't in the client_package, so just copy it
                    {
                        fs.writeFile(new_dir + filename, end_result,  {flag : 'w'}, (err) => {
                            if (err) throw err;
                        
                            //console.log(`FILE: Server ${package_name}/${filename} was untouched and put in /Obfuscated.`);
                            count++;
                            recursing--;
                        }); 
                    }

                })
            }
        })
    })


}

function packhtml(theform) 
{
    return `<script language=\"javascript\">document.write(unescape('${encrypt(theform)}'));</script\>`;
}

function encrypt(tx) { var hex=''; var i; for (i=0; i<tx.length; i++) { hex += '%'+hexfromdec(tx.charCodeAt(i)) } return hex; }
function hexfromdec(num) { if (num > 65535) { return ("err!") } first = Math.round(num/4096 - .5); temp1 = num - first * 4096; second = Math.round(temp1/256 -.5); temp2 = temp1 - second * 256; third = Math.round(temp2/16 - .5); fourth = temp2 - third * 16; return (""+getletter(third)+getletter(fourth)); }
function getletter(num) { if (num < 10) { return num; } else { if (num == 10) { return "A" } if (num == 11) { return "B" } if (num == 12) { return "C" } if (num == 13) { return "D" } if (num == 14) { return "E" } if (num == 15) { return "F" } } } 