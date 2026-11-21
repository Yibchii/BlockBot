import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import * as Blockly from "blockly";
import "blockly/blocks";
import "../IntegerConstantBlock";
import "../coreBlocks";
import "../generators/mazeBotGenerators";
import { loadBlocksFromApi } from "../blockGen";
import { Link2 } from "lucide-react";

let blockDefinitionsPromise;

function ensureBlockDefinitions() {
    if (!blockDefinitionsPromise) {
        blockDefinitionsPromise = loadBlocksFromApi("/api/mazebot2d/blocks");
    }
    return blockDefinitionsPromise;
}

function copySectionLink(hash) {
    const url = `${window.location.origin}${window.location.pathname}${hash}`;
    navigator.clipboard?.writeText(url);
}

function ImageFigure({ src, alt, caption }) {
    return (
        <figure className="content-image-figure">
            <img className="content-image" src={src} alt={alt} />
            {caption && <figcaption className="content-image-caption">{caption}</figcaption>}
        </figure>
    );
}

function BlocklyBlockPreview({ type, fieldName, fieldValue }) {
    const containerRef = useRef(null);

    useEffect(() => {
        let workspace;
        let disposed = false;

        async function renderPreview() {
            await ensureBlockDefinitions();
            if (disposed || !containerRef.current) return;

            workspace = Blockly.inject(containerRef.current, {
                readOnly: true,
                scrollbars: false,
                trashcan: false,
                zoom: {
                    controls: false,
                    wheel: false,
                    startScale: 1,
                },
            });

            let xml;
            if (type === "mazebot2d_move") {
                xml = `
                    <xml>
                        <block type="mazebot2d_move" x="8" y="8">
                            <value name="DIRECTION">
                                <block type="direction_constant">
                                    <field name="DIRECTION">DOWN</field>
                                </block>
                            </value>
                        </block>
                    </xml>
                `;
            } else if (fieldName) {
                xml = `
                    <xml>
                        <block type="${type}" x="8" y="8">
                            <field name="${fieldName}">${fieldValue}</field>
                        </block>
                    </xml>
                `;
            } else {
                xml = `<xml><block type="${type}" x="8" y="8"></block></xml>`;
            }

            Blockly.Xml.domToWorkspace(
                Blockly.utils.xml.textToDom(xml),
                workspace,
            );
            Blockly.svgResize(workspace);
        }

        renderPreview().catch((error) => {
            console.error("Unable to render help block preview.", error);
        });

        return () => {
            disposed = true;
            workspace?.dispose();
        };
    }, [type, fieldName, fieldValue]);

    return <div className="help-block-preview" ref={containerRef} aria-label={`${type} block preview`} />;
}


function Help() {
    const { hash } = useLocation();

    useEffect(() => {
        if (!hash) return;

        const topic = document.getElementById(decodeURIComponent(hash.slice(1)));
        topic?.scrollIntoView({ block: "start" });
    }, [hash]);

    return (
        <main className="help-page">
            <div className="help-container">
                <h1 className="help-title">Help</h1>

                <div className="help-topics">
                    <section className="help-topic" id="navigating-your-first-maze">
                        <div className="help-topic-header">
                            <h2 className="help-topic-title">
                            Tutorial: Navigating Your First Maze{" "}
                                <a
                                    className="help-link"
                                    href="#navigating-your-first-maze"
                                    aria-label="Copy link to Navigating Your First Maze"
                                    title="Copy link"
                                    onClick={() => copySectionLink("#navigating-your-first-maze")}
                                >
                                    <Link2 aria-hidden="true" size={18} />
                                </a>
                            </h2>
                            <h3 className="help-topic-subtitle">Learn the fundamentals of BlockBot by navigating your first maze!</h3>
                        </div>
                        <div>
                            <h2 className="help-section-title">Getting Started</h2>
                            <ol className="help-list">
                                <li>
                                    Navigate to <Link className="help-link" to="/editor">the editor page</Link>.
                                    <p className="help-copy">You should now see the editor interface. Here you will find the workspace and a maze to complete.</p>
                                </li>
                                <li>
                                    Click the "Logic" tab on the left side of the workspace.</li>
                                    <p className="help-copy">This tab contains some blocks regarding the logic of your code. For now, we'll only be using one of them.</p>
                                <li>
                                    Drag and drop the "start" block into the workspace.
                                    <p className="help-copy">This indicates the starting point of your code. When you press Run, whatever block is directly attached to the start block will run first.</p>
                                </li>
                                <li>
                                    Click the "Robot" tab on the left side of the workspace.
                                    <p className="help-copy">This tab contains all the blocks that control the robot's movement.</p>
                                </li>
                                <li>Drag and drop the "move" block into the workspace. Move it so that it is directly attached to the bottom of the "start" block.</li>
                                <li>
                                    Drag and drop the "direction" block into the workspace. Move it so that it is directly attached to the bottom of the "move" block.
                                </li>
                                <li>
                                    Click the dropdown menu on the "direction" block and select "down".
                                </li>
                                <li>
                                    Click the "Run" button at the top of the workspace.
                                    <p className="help-copy">The robot should now move down one space in the maze.</p>
                                </li>
                                <ImageFigure
                                src={`${import.meta.env.BASE_URL}images/firstMazeTutorialFigure1.png`}
                                caption="Figure 1: The current state of the workspace."
                                />
                                <p>You have now moved the robot down one space in the maze, but we need to continue adding blocks to navigate the entire maze.
                                But how do we reach the end of the maze? </p>
                                <p>Your first thought might be to add a "move" block for each space in the maze, but that would be very time-consuming. Instead, we can use a "repeat" block to repeat a set of blocks multiple times.</p>
                                <li>Click the "Loops" tab on the left side of the workspace.</li>
                                <li>Drag a "Repeat _ Times" block into the workspace.</li>
                                <li>Detach the "move" block from the "start program" block.</li>
                                <li>Attach the "Repeat _ Times" block to the "start program" block.</li>
                                <li>
                                    Drag and drop the "move" block into the "Repeat _ Times" block (Figure 2).
                                    <p className="help-copy">Be careful to grab the "move" block itself and not the direction block. Dragging the direction block will disconect it from the move block.</p>
                                
                                    <ImageFigure
                                        src={`${import.meta.env.BASE_URL}images/firstMazeTutorialFigure2.png`}
                                        caption="Figure 2: A repeat block configured to move the robot down ten times."
                                    />
                                </li>
                                <li>
                                    Chain together multiple "Repeat _ Times" blocks to navigate the entire maze (Figure 3).
                                    <p className="help-copy">Note: You can copy and paste blocks and groups of blocks by pressing Ctrl+C and Ctrl+V.</p>
                                    <ImageFigure
                                        src={`${import.meta.env.BASE_URL}images/firstMazeTutorialFigure3.png`}
                                        alt="A complete maze program using repeat blocks and the robot maze simulator"
                                        caption="Figure 3: A complete maze program and its resulting robot path."
                                    />
                                </li>
                            </ol>
                            <p>
                                You should now have a bot that reaches the end of the maze. Try experimenting with different blocks to find other solutions that use even less blocks.
                                You can even try messing around with logic blocks and sensors to see if you can make a solution that works for any maze!
                            </p>
                        </div>
                    </section>
                    <section className="help-topic" id="block-descriptions">
                        <h2 className="help-topic-title">
                            Quick Reference: Block Descriptions{" "}
                            <a
                                className="help-link"
                                href="#block-descriptions"
                                aria-label="Copy link to Block Descriptions"
                                title="Copy link"
                                onClick={() => copySectionLink("#block-descriptions")}
                            >
                                <Link2 aria-hidden="true" size={18} />
                            </a>
                        </h2>
                        <p>Here you can find descriptions of the most common blocks available in the editor and how to use them.</p>
                        <ul className="help-block-list">
                            <li className="help-block-description" id="start-block">
                                <BlocklyBlockPreview type="start_program" />
                                <div>
                                    <strong>Start Block</strong>
                                    <p className="help-copy">Indicates the starting point of your code. Connect the first block you want to run to the bottom of this block.</p>
                                </div>
                            </li>
                            <li className="help-block-description" id="move-block">
                                <BlocklyBlockPreview type="mazebot2d_move" fieldName="DIRECTION" fieldValue="DOWN" />
                                <div>
                                    <strong>Move Block</strong>
                                    <p className="help-copy">Moves the robot in a specified direction. Connect a Direction Block to specify the direction of movement.</p>
                                </div>
                            </li>

                            <li className="help-block-description" id="direction-block">
                                <BlocklyBlockPreview type="direction_constant" fieldName="DIRECTION" fieldValue="DOWN" />
                                <div>
                                    <strong>Direction Block</strong>
                                    <p className="help-copy">Specifies a direction. Can be paired with other blocks like the move block.</p>
                                </div>
                            </li>
                            <li className="help-block-description" id="repeat-x-times-block">
                                <BlocklyBlockPreview type="controls_repeat_ext" fieldName="TIMES" fieldValue="5" />
                                <div>
                                    <strong>Repeat _ Times Block</strong>
                                    <p className="help-copy">Repeats the blocks placed inside a specified number of times.</p>
                                </div>
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </main>
    );
}

export default Help;