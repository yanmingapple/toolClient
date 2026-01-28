/**
 * Copyright (c) 2006-2020, JGraph Ltd
 * Copyright (c) 2006-2020, draw.io AG
 */
(function()
{
	// Adds scrollbars for menus that exceed the page height
	var mxPopupMenuShowMenu = mxPopupMenu.prototype.showMenu;
	mxPopupMenu.prototype.showMenu = function()
	{
		mxPopupMenuShowMenu.apply(this, arguments);
		
		this.div.style.overflowY = 'auto';
		this.div.style.overflowX = 'hidden';
		var h0 = Math.max(document.body.clientHeight, document.documentElement.clientHeight);
		this.div.style.maxHeight = (h0 - 10) + 'px';
	};
	
	Menus.prototype.createHelpLink = function(href)
	{
		if (urlParams['customMenu'] != '1') {  // yanwx,定制菜单
			return null;
		}

		var link = document.createElement('span');
		link.setAttribute('title', mxResources.get('help'));
		link.style.cssText = 'color:blue;text-decoration:underline;margin-left:8px;cursor:help;';
		
		var icon = document.createElement('img');
		mxUtils.setOpacity(icon, 50);
		icon.style.height = '16px';
		icon.style.width = '16px';
		icon.setAttribute('border', '0');
		icon.setAttribute('valign', 'bottom');
		icon.setAttribute('src', Editor.helpImage);
		link.appendChild(icon);
		
		mxEvent.addGestureListeners(link, mxUtils.bind(this, function(evt)
		{
			this.editorUi.hideCurrentMenu();
			this.editorUi.openLink(href);
			mxEvent.consume(evt);
		}));
		
		return link;
	};

	Menus.prototype.addLinkToItem = function(item, href)
	{
		if (item != null 
			&& (urlParams['customMenu'] != '1'))  // yanwx,定制菜单
		{
			item.firstChild.nextSibling.appendChild(this.createHelpLink(href));
		}
	};
	var menusInit = Menus.prototype.init;
	Menus.prototype.init = function()
	{
		window.editorUi = this.editorUi;
		menusInit.apply(this, arguments);
		var editorUi = this.editorUi;
		editorUi.initFormula();
		var graph = editorUi.editor.graph;
		var isGraphEnabled = mxUtils.bind(graph, graph.isEnabled);
		var googleEnabled = ((urlParams['embed'] != '1' && urlParams['gapi'] != '0') ||
			(urlParams['embed'] == '1' && urlParams['gapi'] == '1')) && mxClient.IS_SVG &&
			isLocalStorage && (document.documentMode == null || document.documentMode >= 10);
		var dropboxEnabled = ((urlParams['embed'] != '1' && urlParams['db'] != '0') || (urlParams['embed'] == '1' && urlParams['db'] == '1')) &&
			mxClient.IS_SVG && (document.documentMode == null || document.documentMode > 9);
		var oneDriveEnabled = (window.location.hostname == 'www.draw.io' || window.location.hostname == 'test.draw.io' ||
			window.location.hostname == 'drive.draw.io' || window.location.hostname == 'app.diagrams.net') &&
			(((urlParams['embed'] != '1' && urlParams['od'] != '0') || (urlParams['embed'] == '1' && urlParams['od'] == '1')) &&
			!mxClient.IS_IOS && (navigator.userAgent.indexOf('MSIE') < 0 || document.documentMode >= 10));
		var trelloEnabled = urlParams['tr'] == '1' && mxClient.IS_SVG && (document.documentMode == null ||
			document.documentMode > 9);

		if (!mxClient.IS_SVG && !editorUi.isOffline())
		{
			var img = new Image();
			img.src = IMAGE_PATH + '/help.png';
		}
		
		if (urlParams['noFileMenu'] == '1')
		{
			this.defaultMenuItems = this.defaultMenuItems.filter(function(m)
			{
				return m != 'file';
			});
		}

		editorUi.actions.addAction('new...', function()
		{
			var compact = editorUi.isOffline();
			
			if (!compact && urlParams['newTempDlg'] == '1' && editorUi.mode == App.MODE_GOOGLE)
			{
				function driveObjToTempDlg(item)
				{
					return {id: item.id, isExt: true, url: item.downloadUrl, title: item.title, imgUrl: item.thumbnailLink,
							changedBy: item.lastModifyingUserName, lastModifiedOn: item.modifiedDate}
				};
				
				var tempDlg = new TemplatesDialog(editorUi, function(templateXml, title, infoObj)
				{
					var templateLibs = infoObj.libs, templateClibs = infoObj.clibs;

					editorUi.pickFolder(editorUi.mode, function(folderId)
					{
						editorUi.createFile(title, templateXml, (templateLibs != null &&
							templateLibs.length > 0) ? templateLibs : null, null, function()
						{
							editorUi.hideDialog();
						}, null, folderId, null, (templateClibs != null &&
							templateClibs.length > 0) ? templateClibs : null);
					}, editorUi.stateArg == null ||
						editorUi.stateArg.folderId == null);
					
				}, null, null, null, 'user', function(callback, error, username)
				{
					var oneWeek = new Date();
					oneWeek.setDate(oneWeek.getDate() - 7);
					
					editorUi.drive.listFiles(null, oneWeek, username? true : false, function(resp)
					{
						var results = [];
						
						for (var i = 0; i < resp.items.length; i++)
						{
							results.push(driveObjToTempDlg(resp.items[i]));
						}
						
						callback(results);
					}, error)
				}, function(str, callback, error, username)
				{
					editorUi.drive.listFiles(str, null, username? true : false, function(resp)
					{
						var results = [];
						
						for (var i = 0; i < resp.items.length; i++)
						{
							results.push(driveObjToTempDlg(resp.items[i]));
						}
						
						callback(results);
					}, error)
				}, function(obj, callback, error)
				{
					editorUi.drive.getFile(obj.id, function(file)
					{
						callback(file.data);
					}, error);
				}, null, null, false, false);
				
				editorUi.showDialog(tempDlg.container, window.innerWidth, window.innerHeight, true, false, null, false, true);

				return;	
			};
			
			var dlg = new NewDialog(editorUi, compact, !(editorUi.mode == App.MODE_DEVICE && 'chooseFileSystemEntries' in window));

			editorUi.showDialog(dlg.container, (compact) ? 350 : 620, (compact) ? 70 : 460, true, true, function(cancel)
			{
				editorUi.sidebar.hideTooltip();
				
				if (cancel && editorUi.getCurrentFile() == null)
				{
					editorUi.showSplash();
				}
			});
			
			dlg.init();
		});

		editorUi.actions.put('insertTemplate', new Action(mxResources.get('template') + '...', function()
		{
			console.log('insertTemplate');
			if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent()))
			{
				var dlg = new NewDialog(editorUi, null, false, function(xml)
				{
					editorUi.hideDialog();
					if (xml != null)
					{
						var insertPoint = editorUi.editor.graph.getFreeInsertPoint();
						graph.setSelectionCells(editorUi.importXml(xml,
							Math.max(insertPoint.x, 20),
							Math.max(insertPoint.y, 20),
							true, null, null, true));
						graph.scrollCellToVisible(graph.getSelectionCell());
					}
				}, null, null, null, null, null, null, null, null, null, null,
					false, mxResources.get('insert'));
	
				editorUi.showDialog(dlg.container, 620, 460, true, true, function()
				{
					editorUi.sidebar.hideTooltip();
				});
				
				dlg.init();
			}
		})).isEnabled = isGraphEnabled;
		
		var pointAction = editorUi.actions.addAction('points', function()
		{
			editorUi.editor.graph.view.setUnit(mxConstants.POINTS);
		});
		
		pointAction.setToggleAction(true);
		pointAction.setSelectedCallback(function() { return editorUi.editor.graph.view.unit == mxConstants.POINTS; });
		
		var inchAction = editorUi.actions.addAction('inches', function()
		{
			editorUi.editor.graph.view.setUnit(mxConstants.INCHES);
		});
		
		inchAction.setToggleAction(true);
		inchAction.setSelectedCallback(function() { return editorUi.editor.graph.view.unit == mxConstants.INCHES; });
		
		var mmAction = editorUi.actions.addAction('millimeters', function()
		{
			editorUi.editor.graph.view.setUnit(mxConstants.MILLIMETERS);
		});
		
		mmAction.setToggleAction(true);
		mmAction.setSelectedCallback(function() { return editorUi.editor.graph.view.unit == mxConstants.MILLIMETERS; });

		var meterAction = editorUi.actions.addAction('meters', function()
		{
			editorUi.editor.graph.view.setUnit(mxConstants.METERS);
		});
		
		meterAction.setToggleAction(true);
		meterAction.setSelectedCallback(function() { return editorUi.editor.graph.view.unit == mxConstants.METERS; });

		this.put('units', new Menu(mxUtils.bind(this, function(menu, parent)
		{
			this.addMenuItems(menu, ['points', 'inches', 'millimeters', 'meters'], parent);
		})));
		
		var rulerAction = editorUi.actions.addAction('ruler', function()
		{
			mxSettings.setRulerOn(!mxSettings.isRulerOn());
			mxSettings.save();
			
			if (editorUi.ruler != null)
			{
				editorUi.ruler.destroy();
				editorUi.ruler = null;
				editorUi.refresh();
			}
			else
			{
				editorUi.ruler = new mxDualRuler(editorUi, editorUi.editor.graph.view.unit);
				editorUi.refresh();
			}
		});
		rulerAction.setEnabled(editorUi.canvasSupported && document.documentMode != 9);
		rulerAction.setToggleAction(true);
		rulerAction.setSelectedCallback(function() { return editorUi.ruler != null; });
		
        var fullscreenAction = editorUi.actions.addAction('fullscreen', function()
		{
			if (urlParams['embedInline'] == '1')
			{
				editorUi.setInlineFullscreen(!Editor.inlineFullscreen);
			}
			else
			{
				if (document.fullscreenElement == null)
				{
					document.body.requestFullscreen();
				}
				else
				{
					document.exitFullscreen();
				}
			}
		});
		fullscreenAction.visible = urlParams['embedInline'] == '1' ||
			(document.fullscreenEnabled && document.body.requestFullscreen != null);
		fullscreenAction.setToggleAction(true);
		fullscreenAction.setSelectedCallback(function()
		{
			return urlParams['embedInline'] == '1' ? 
				Editor.inlineFullscreen :
				document.fullscreenElement != null;
		});
		
		editorUi.actions.addAction('properties...', function()
		{
			var dlg = new FilePropertiesDialog(editorUi);
			editorUi.showDialog(dlg.container, 320, 120, true, true);
			dlg.init();
		}).isEnabled = isGraphEnabled;
	
		if (window.mxFreehand)
		{
			editorUi.actions.put('insertFreehand', new Action(mxResources.get('freehand') + '...', function(evt)
			{
				if (graph.isEnabled())
				{
					if (this.freehandWindow == null)
					{
						this.freehandWindow = new FreehandWindow(editorUi, document.body.offsetWidth - 420, 102, 176, 84);
					}
					
					if (graph.freehand.isDrawing())
					{
						graph.freehand.stopDrawing();
					}
					else
					{
						graph.freehand.startDrawing();
					}
					
					this.freehandWindow.window.setVisible(graph.freehand.isDrawing());
				}
			})).isEnabled = function()
			{
				return isGraphEnabled() && mxClient.IS_SVG;
			};
		}
		
		editorUi.actions.put('exportXml', new Action(mxResources.get('formatXml') + '...', function()
		{
			var div = document.createElement('div');
			div.style.whiteSpace = 'nowrap';
			var noPages = editorUi.pages == null || editorUi.pages.length <= 1;
			
			var hd = document.createElement('h3');
			mxUtils.write(hd, mxResources.get('formatXml'));
			hd.style.cssText = 'width:100%;text-align:center;margin-top:0px;margin-bottom:4px';
			div.appendChild(hd);
			
			var selection = editorUi.addCheckbox(div, mxResources.get('selectionOnly'),
				false, graph.isSelectionEmpty());
			var compressed = editorUi.addCheckbox(div, mxResources.get('compressed'), true);
			var pages = editorUi.addCheckbox(div, mxResources.get('allPages'), !noPages, noPages);
			pages.style.marginBottom = '16px';
			
			mxEvent.addListener(selection, 'change', function()
			{
				if (selection.checked)
				{
					pages.setAttribute('disabled', 'disabled');
				}
				else
				{
					pages.removeAttribute('disabled');
				}
			});
			
			var dlg = new CustomDialog(editorUi, div, mxUtils.bind(this, function()
			{
				editorUi.downloadFile('xml', !compressed.checked, null,
					!selection.checked, noPages || !pages.checked);
			}), null, mxResources.get('export'));
			
			editorUi.showDialog(dlg.container, 300, 200, true, true);
		}));
		
		if (Editor.enableExportUrl)
		{
			editorUi.actions.put('exportUrl', new Action(mxResources.get('url') + '...', function()
			{
				editorUi.showPublishLinkDialog(mxResources.get('url'), true, null, null,
					function(linkTarget, linkColor, allPages, lightbox, editLink, layers, width, height, tags)
				{
					var params = [];

					if (tags)
					{
						params.push('tags=%7B%7D');
					}

					var dlg = new EmbedDialog(editorUi, editorUi.createLink(linkTarget, linkColor,
						allPages, lightbox, editLink, layers, null, true, params));
					editorUi.showDialog(dlg.container, 450, 240, true, true);
					dlg.init();
				});
			}));
		}
		
		editorUi.actions.put('exportHtml', new Action(mxResources.get('formatHtmlEmbedded') + '...', function()
		{
			if (editorUi.spinner.spin(document.body, mxResources.get('loading')))
			{
				editorUi.getPublicUrl(editorUi.getCurrentFile(), function(url)
				{
					editorUi.spinner.stop();
					
					editorUi.showHtmlDialog(mxResources.get('export'), null, url, function(publicUrl, zoomEnabled,
						initialZoom, linkTarget, linkColor, fit, allPages, layers, tags, lightbox, editLink)
					{
						editorUi.createHtml(publicUrl, zoomEnabled, initialZoom, linkTarget, linkColor, fit, allPages,
							layers, tags, lightbox, editLink, mxUtils.bind(this, function(html, scriptTag)
							{
								var basename = editorUi.getBaseFilename(allPages);
								var result = '<!--[if IE]><meta http-equiv="X-UA-Compatible" content="IE=5,IE=9" ><![endif]-->\n' +
									'<!DOCTYPE html>\n<html>\n<head>\n<title>' + mxUtils.htmlEntities(basename) + '</title>\n' +
									'<meta charset="utf-8"/>\n</head>\n<body>' + html + '\n' + scriptTag + '\n</body>\n</html>';
								editorUi.saveData(basename + ((basename.substring(basename.lenth - 7) ==
									'.drawio') ? '' : '.drawio') + '.html', 'html', result, 'text/html');
							}));
					});
				});
			}
		}));
		
		editorUi.actions.put('exportPdf', new Action(mxResources.get('formatPdf') + '...', function()
		{
			if (!EditorUi.isElectronApp && (editorUi.isOffline() || editorUi.printPdfExport))
			{
				// Export PDF action for chrome OS (same as print with different dialog title)
				editorUi.showDialog(new PrintDialog(editorUi, mxResources.get('formatPdf')).container, 360,
						(editorUi.pages != null && editorUi.pages.length > 1 && (editorUi.editor.editable ||
						urlParams['hide-pages'] != '1')) ?
						450 : 370, true, true);
			}
			else
			{
				var noPages = editorUi.pages == null || editorUi.pages.length <= 1;
				var div = document.createElement('div');
				div.style.whiteSpace = 'nowrap';
				
				var hd = document.createElement('h3');
				mxUtils.write(hd, mxResources.get('formatPdf'));
				hd.style.cssText = 'width:100%;text-align:center;margin-top:0px;margin-bottom:4px';
				div.appendChild(hd);
				
				var cropEnableFn = function()
				{
					if (allPages != this && this.checked)
					{
						crop.removeAttribute('disabled');
						crop.checked = !graph.pageVisible;
					}
					else
					{
						crop.setAttribute('disabled', 'disabled');
						crop.checked = false;
					}
				};
				
				var dlgH = 200;
				var pageCount = 1;
				var currentPage = null;
				
				if (editorUi.pdfPageExport && !noPages)
				{
					var allPages = editorUi.addRadiobox(div, 'pages', mxResources.get('allPages'), true);
					var pagesRadio = editorUi.addRadiobox(div, 'pages', mxResources.get('pages') + ':', false, null, true);

					var pagesFromInput = document.createElement('input');
					pagesFromInput.style.cssText = 'margin:0 8px 0 8px;'
					pagesFromInput.setAttribute('value', '1');
					pagesFromInput.setAttribute('type', 'number');
					pagesFromInput.setAttribute('min', '1');
					pagesFromInput.style.width = '50px';
					div.appendChild(pagesFromInput);
					
					var span = document.createElement('span');
					mxUtils.write(span, mxResources.get('to'));
					div.appendChild(span);
					
					var pagesToInput = pagesFromInput.cloneNode(true);
					div.appendChild(pagesToInput);

					mxEvent.addListener(pagesFromInput, 'focus', function()
					{
						pagesRadio.checked = true;
					});
					
					mxEvent.addListener(pagesToInput, 'focus', function()
					{
						pagesRadio.checked = true;
					});					

					function validatePageRange()
					{
						pagesToInput.value = Math.max(1, Math.min(pageCount, Math.max(parseInt(pagesToInput.value), parseInt(pagesFromInput.value))));
						pagesFromInput.value = Math.max(1, Math.min(pageCount, Math.min(parseInt(pagesToInput.value), parseInt(pagesFromInput.value))));
					};
					
					mxEvent.addListener(pagesFromInput, 'change', validatePageRange);
					mxEvent.addListener(pagesToInput, 'change', validatePageRange);
					
					if (editorUi.pages != null)
					{
						pageCount = editorUi.pages.length;
			
						if (editorUi.currentPage != null)
						{
							for (var i = 0; i < editorUi.pages.length; i++)
							{
								if (editorUi.currentPage == editorUi.pages[i])
								{
									currentPage = i + 1;
									pagesFromInput.value = currentPage;
									pagesToInput.value = currentPage;
									break;
								}
							}
						}
					}
					
					pagesFromInput.setAttribute('max', pageCount);
					pagesToInput.setAttribute('max', pageCount);
					mxUtils.br(div);

					var selection = editorUi.addRadiobox(div, 'pages', mxResources.get('selectionOnly'), false, graph.isSelectionEmpty());
					var crop = editorUi.addCheckbox(div, mxResources.get('crop'), false, true);
					var grid = editorUi.addCheckbox(div, mxResources.get('grid'), false, false);
					
					mxEvent.addListener(allPages, 'change', cropEnableFn);
					mxEvent.addListener(pagesRadio, 'change', cropEnableFn);
					mxEvent.addListener(selection, 'change', cropEnableFn);
					dlgH += 64;
				}
				else
				{
					var selection = editorUi.addCheckbox(div, mxResources.get('selectionOnly'),
							false, graph.isSelectionEmpty());
					var crop = editorUi.addCheckbox(div, mxResources.get('crop'),
							!graph.pageVisible || !editorUi.pdfPageExport,
							!editorUi.pdfPageExport);
					var grid = editorUi.addCheckbox(div, mxResources.get('grid'), false, false);
					
					// Crop is only enabled if selection only is selected
					if (!editorUi.pdfPageExport)
					{
						mxEvent.addListener(selection, 'change', cropEnableFn);	
					}
				}
				
				var isDrawioWeb = !mxClient.IS_CHROMEAPP && !EditorUi.isElectronApp &&
					editorUi.getServiceName() == 'draw.io';

				var transparentBkg = null, include = null;
				
				if (EditorUi.isElectronApp || isDrawioWeb)
				{
					include = editorUi.addCheckbox(div, mxResources.get('includeCopyOfMyDiagram'),
						Editor.defaultIncludeDiagram);
					dlgH += 30;
				}
				
				if (isDrawioWeb)
				{
					transparentBkg = editorUi.addCheckbox(div,
							mxResources.get('transparentBackground'), false);
					
					dlgH += 30;
				}

				var dlg = new CustomDialog(editorUi, div, mxUtils.bind(this, function()
				{
					var pageRange = null;

					if (!noPages)
					{
						var from = parseInt(pagesFromInput.value);
						var to = parseInt(pagesToInput.value);
						pageRange = (!allPages.checked &&
							(from != currentPage || to != currentPage)) ?
							{from: Math.max(0, Math.min(pageCount - 1, from - 1)),
							to: Math.max(0, Math.min(pageCount - 1, to - 1))} : null;
					}
					
					editorUi.downloadFile('pdf', null, null, !selection.checked,
						noPages? true : !allPages.checked && pageRange == null,
						!crop.checked, transparentBkg != null && transparentBkg.checked, null,
						null, grid.checked, include != null && include.checked, pageRange);
				}), null, mxResources.get('export'));
				editorUi.showDialog(dlg.container, 300, dlgH, true, true);
			}
		}));
		
		editorUi.actions.addAction('open...', function()
		{
			editorUi.pickFile();
		});
		
		editorUi.actions.addAction('close', function()
		{
			var currentFile = editorUi.getCurrentFile();
			
			function fn()
			{
				if (currentFile != null)
				{
					currentFile.removeDraft();
				}
				
				editorUi.fileLoaded(null);
			};
			
			if (currentFile != null && currentFile.isModified())
			{
				editorUi.confirm(mxResources.get('allChangesLost'), null, fn,
					mxResources.get('cancel'), mxResources.get('discardChanges'));
			}
			else
			{
				fn();
			}
		});
		
		editorUi.actions.addAction('editShape...', mxUtils.bind(this, function()
		{
			var cells = graph.getSelectionCells();
			
			if (graph.getSelectionCount() == 1)
			{
				var cell = graph.getSelectionCell();
				var state = graph.view.getState(cell);
				
				if (state != null && state.shape != null && state.shape.stencil != null)
				{
			    	var dlg = new EditShapeDialog(editorUi, cell, mxResources.get('editShape') + ':', 630, 400);
					editorUi.showDialog(dlg.container, 640, 480, true, false);
					dlg.init();
				}
			}
		}));
		
		editorUi.actions.addAction('revisionHistory...', function()
		{
			if (!editorUi.isRevisionHistorySupported())
			{
				editorUi.showError(mxResources.get('error'), mxResources.get('notAvailable'), mxResources.get('ok'));
			}
			else if (editorUi.spinner.spin(document.body, mxResources.get('loading')))
			{
				editorUi.getRevisions(mxUtils.bind(this, function(revs, restoreFn)
				{
					editorUi.spinner.stop();
					var dlg = new RevisionDialog(editorUi, revs, restoreFn);
					editorUi.showDialog(dlg.container, 640, 480, true, true);
					dlg.init();
				}), mxUtils.bind(this, function(err)
				{
					editorUi.handleError(err);
				}));
			}
		});
		
		editorUi.actions.addAction('createRevision', function()
		{
			editorUi.actions.get('save').funct();
		}, null, null, Editor.ctrlKey + '+S');
		
		var action = editorUi.actions.addAction('synchronize', function()
		{
			editorUi.synchronizeCurrentFile(DrawioFile.SYNC == 'none');
		}, null, null, 'Alt+Shift+S');
		
		// Changes the label if synchronization is disabled
		if (DrawioFile.SYNC == 'none')
		{
			action.label = mxResources.get('refresh');
		}
		
		editorUi.actions.addAction('upload...', function()
		{
			var file = editorUi.getCurrentFile();
			
			if (file != null)
			{
				// Data is pulled from global variable after tab loads
				// LATER: Change to use message passing to deal with potential cross-domain
				window.drawdata = editorUi.getFileData();
				var filename = (file.getTitle() != null) ? file.getTitle() : editorUi.defaultFilename;
				editorUi.openLink(window.location.protocol + '//' + window.location.host + '/?create=drawdata&' +
						((editorUi.mode == App.MODE_DROPBOX) ? 'mode=dropbox&' : '') +
						'title=' + encodeURIComponent(filename), null, true);
			}
		});

		if (typeof(MathJax) !== 'undefined')
		{
			var action = editorUi.actions.addAction('mathematicalTypesetting', function()
			{
				var change = new ChangePageSetup(editorUi);
				change.ignoreColor = true;
				change.ignoreImage = true;
				change.mathEnabled = !editorUi.isMathEnabled();
				
				graph.model.execute(change);
			});
			
			action.setToggleAction(true);
			action.setSelectedCallback(function() { return editorUi.isMathEnabled(); });
			action.isEnabled = isGraphEnabled;
		}
		
		if (isLocalStorage)
		{
			var action = editorUi.actions.addAction('showStartScreen', function()
			{
				mxSettings.setShowStartScreen(!mxSettings.getShowStartScreen());
				mxSettings.save();
			});
			
			action.setToggleAction(true);
			action.setSelectedCallback(function() { return mxSettings.getShowStartScreen(); });
		}

		var autosaveAction = editorUi.actions.addAction('autosave', function()
		{
			editorUi.editor.setAutosave(!editorUi.editor.autosave);
		});
		
		autosaveAction.setToggleAction(true);
		autosaveAction.setSelectedCallback(function()
		{
			return autosaveAction.isEnabled() && editorUi.editor.autosave;
		});
		
		editorUi.actions.addAction('editGeometry...', function()
		{
			var cells = graph.getSelectionCells();
			var vertices = [];
			
			for (var i = 0; i < cells.length; i++)
			{
				if (graph.getModel().isVertex(cells[i]))
				{
					vertices.push(cells[i]);
				}
			}
			
			if (vertices.length > 0)
			{
				var dlg = new EditGeometryDialog(editorUi, vertices);
				editorUi.showDialog(dlg.container, 200, 270, true, true);
				dlg.init();
			}
		}, null, null, Editor.ctrlKey + '+Shift+M');

		var currentStyle = null;
		
		editorUi.actions.addAction('copyStyle', function()
		{
			if (graph.isEnabled() && !graph.isSelectionEmpty())
			{
				currentStyle = graph.copyStyle(graph.getSelectionCell())
			}
		}, null, null, Editor.ctrlKey + '+Shift+C');

		editorUi.actions.addAction('pasteStyle', function()
		{
			if (graph.isEnabled() && !graph.isSelectionEmpty() && currentStyle != null)
			{
				graph.pasteStyle(currentStyle, graph.getSelectionCells())
			}
		}, null, null, Editor.ctrlKey + '+Shift+V');
		
		editorUi.actions.put('pageBackgroundImage', new Action(mxResources.get('backgroundImage') + '...', function()
		{
			if (!editorUi.isOffline())
			{
				var apply = function(image)
				{
					editorUi.setBackgroundImage(image);
				};
	
				var dlg = new BackgroundImageDialog(editorUi, apply);
				editorUi.showDialog(dlg.container, 320, 170, true, true);
				dlg.init();
			}
		}));

		editorUi.actions.put('exportSvg', new Action(mxResources.get('formatSvg') + '...', function()
		{
			editorUi.showExportDialog(mxResources.get('formatSvg'), true, mxResources.get('export'),
				'https://www.diagrams.net/doc/faq/export-diagram',
				mxUtils.bind(this, function(scale, transparentBackground, ignoreSelection,
					addShadow, editable, embedImages, border, cropImage, currentPage,
					linkTarget, grid, keepTheme, exportType, embedFonts)
				{
					var val = parseInt(scale);
					
					if (!isNaN(val) && val > 0)
					{
						editorUi.exportSvg(val / 100, transparentBackground, ignoreSelection,
							addShadow, editable, embedImages, border, !cropImage, false,
							linkTarget, keepTheme, exportType, embedFonts);
					}
				}), true, null, 'svg', true);
		}));
		
		editorUi.actions.put('exportPng', new Action(mxResources.get('formatPng') + '...', function()
		{
			if (editorUi.isExportToCanvas())
			{
				editorUi.showExportDialog(mxResources.get('image'), false, mxResources.get('export'),
					'https://www.diagrams.net/doc/faq/export-diagram',
					mxUtils.bind(this, function(scale, transparentBackground, ignoreSelection, addShadow, editable,
						embedImages, border, cropImage, currentPage, dummy, grid, keepTheme, exportType)
					{
						var val = parseInt(scale);
						
						if (!isNaN(val) && val > 0)
						{
							editorUi.exportImage(val / 100, transparentBackground, ignoreSelection,
								addShadow, editable, border, !cropImage, false, null, grid, null,
								keepTheme, exportType);
						}
					}), true, Editor.defaultIncludeDiagram, 'png', true);
			}
			else if (!editorUi.isOffline() && (!mxClient.IS_IOS || !navigator.standalone))
			{
				editorUi.showRemoteExportDialog(mxResources.get('export'), null, mxUtils.bind(this, function(ignoreSelection, editable, transparent, scale, border)
				{
					editorUi.downloadFile((editable) ? 'xmlpng' : 'png', null, null, ignoreSelection, null, null, transparent, scale, border);
				}), false, true);
			}
		}));
		
		editorUi.actions.put('exportJpg', new Action(mxResources.get('formatJpg') + '...', function()
		{
			if (editorUi.isExportToCanvas())
			{
				editorUi.showExportDialog(mxResources.get('image'), false, mxResources.get('export'),
					'https://www.diagrams.net/doc/faq/export-diagram',
					mxUtils.bind(this, function(scale, transparentBackground, ignoreSelection, addShadow, editable,
						embedImages, border, cropImage, currentPage, dummy, grid, keepTheme, exportType)
					{
						var val = parseInt(scale);
						
						if (!isNaN(val) && val > 0)
						{
							editorUi.exportImage(val / 100, false, ignoreSelection,
								addShadow, false, border, !cropImage, false, 'jpeg',
								grid, null, keepTheme, exportType);
						}
					}), true, false, 'jpeg', true);
			}
			else if (!editorUi.isOffline() && (!mxClient.IS_IOS || !navigator.standalone))
			{
				editorUi.showRemoteExportDialog(mxResources.get('export'), null, mxUtils.bind(this, function(ignoreSelection, editable, tranaparent, scale, border)
				{
					editorUi.downloadFile('jpeg', null, null, ignoreSelection, null, null, null, scale, border);
				}), true, true);
			}
		}));

		action = editorUi.actions.addAction('copyAsImage', mxUtils.bind(this, function()
		{
			var cells = mxUtils.sortCells(graph.model.getTopmostCells(graph.getSelectionCells()));
			var xml = mxUtils.getXml((cells.length == 0) ? editorUi.editor.getGraphXml() : graph.encodeCells(cells));
			editorUi.copyImage(cells, xml);
		}));

		// Disabled in Safari as operation is not allowed
		action.visible = Editor.enableNativeCipboard && editorUi.isExportToCanvas() && !mxClient.IS_SF;
		
		action = editorUi.actions.put('shadowVisible', new Action(mxResources.get('shadow'), function()
		{
			graph.setShadowVisible(!graph.shadowVisible);
		}));
		action.setToggleAction(true);
		action.setSelectedCallback(function() { return graph.shadowVisible; });

		editorUi.actions.put('about', new Action(mxResources.get('about') + ' ' + EditorUi.VERSION + '...', function()
		{
			if (editorUi.isOffline() || mxClient.IS_CHROMEAPP || EditorUi.isElectronApp)
			{
				editorUi.alert(editorUi.editor.appName + ' ' + EditorUi.VERSION);
			}
			else
			{
				editorUi.openLink('https://www.diagrams.net/');
			}
		}));
		
		editorUi.actions.addAction('support...', function()
		{
			if (EditorUi.isElectronApp)
			{
				// editorUi.openLink('https://github.com/jgraph/drawio-desktop/wiki/Getting-Support');
				editorUi.openLink(window.Support_url);	// yanwx
			}
			else
			{
				// editorUi.openLink('https://github.com/jgraph/drawio/wiki/Getting-Support');
				editorUi.openLink(window.Support_url);	// yanwx
			}
		});

		editorUi.actions.addAction('exportOptionsDisabled...', function()
		{
			editorUi.handleError({message: mxResources.get('exportOptionsDisabledDetails')},
				mxResources.get('exportOptionsDisabled'));
		});

		editorUi.actions.addAction('keyboardShortcuts...', function()
		{
			if (mxClient.IS_SVG && !mxClient.IS_CHROMEAPP && !EditorUi.isElectronApp)
			{
				editorUi.openLink('shortcuts.svg');
			}
			else
			{
				editorUi.openLink('https://viewer.diagrams.net/#Uhttps%3A%2F%2Fviewer.diagrams.net%2Fshortcuts.svg');
			}
		});

		editorUi.actions.addAction('feedback...', function()
		{
			var dlg = new FeedbackDialog(editorUi);
			editorUi.showDialog(dlg.container, 610, 360, true, false);
			dlg.init();
		});

		editorUi.actions.addAction('quickStart...', function()
		{
			// editorUi.openLink('https://www.youtube.com/watch?v=Z0D96ZikMkc');
			editorUi.openLink(window.quickStart_url);	// yanwx
		});
		
		editorUi.actions.addAction('forkme', function()
		{
			if (EditorUi.isElectronApp)
			{
				editorUi.openLink('https://github.com/jgraph/drawio-desktop');
			}
			else
			{
				editorUi.openLink('https://github.com/jgraph/drawio');
			}
		}).label = 'Fork me on GitHub...';
		
		editorUi.actions.addAction('downloadDesktop...', function()
		{
			editorUi.openLink('https://get.diagrams.net/');
		});
		
		action = editorUi.actions.addAction('tags', mxUtils.bind(this, function()
		{
			if (this.tagsWindow == null)
			{
				this.tagsWindow = new TagsWindow(editorUi, document.body.offsetWidth - 400, 60, 212, 200);
				this.tagsWindow.window.addListener('show', mxUtils.bind(this, function()
				{
					editorUi.fireEvent(new mxEventObject('tags'));
					this.tagsWindow.window.fit();
				}));
				this.tagsWindow.window.addListener('hide', function()
				{
					editorUi.fireEvent(new mxEventObject('tags'));
				});
				this.tagsWindow.window.setVisible(true);
				editorUi.fireEvent(new mxEventObject('tags'));
			}
			else
			{
				this.tagsWindow.window.setVisible(!this.tagsWindow.window.isVisible());
			}
		}));
		action.setToggleAction(true);
		action.setSelectedCallback(mxUtils.bind(this, function() { return this.tagsWindow != null && this.tagsWindow.window.isVisible(); }));

		action = editorUi.actions.addAction('findReplace...', mxUtils.bind(this, function(arg1, evt)
		{
			var findReplace = graph.isEnabled() && (evt == null || !mxEvent.isShiftDown(evt));
			var evtName = (findReplace) ? 'findReplace' : 'find';
			var name = evtName + 'Window';
			
			if (this[name] == null)
			{
				var w = (findReplace) ? ((uiTheme == 'min') ? 330 : 300) : 240;
				var h = (findReplace) ? ((uiTheme == 'min') ? 304 : 288) : 170;
				this[name] = new FindWindow(editorUi,
					document.body.offsetWidth - (w + 20),
					100, w, h, findReplace);
				this[name].window.addListener('show', function()
				{
					editorUi.fireEvent(new mxEventObject(evtName));
				});
				this[name].window.addListener('hide', function()
				{
					editorUi.fireEvent(new mxEventObject(evtName));
				});
				this[name].window.setVisible(true);
			}
			else
			{
				this[name].window.setVisible(!this[name].window.isVisible());
			}
		}), null, null, Editor.ctrlKey + '+F');
		action.setToggleAction(true);
		action.setSelectedCallback(mxUtils.bind(this, function()
		{
			var name = (graph.isEnabled()) ? 'findReplaceWindow' : 'findWindow';
			
			return this[name] != null && this[name].window.isVisible();
		}));
		
		editorUi.actions.put('exportVsdx', new Action(mxResources.get('formatVsdx') + ' (beta)...', function()
		{
			var noPages = editorUi.pages == null || editorUi.pages.length <= 1;
			
			if (noPages)
			{
				editorUi.exportVisio();
			}
			else
			{
				var div = document.createElement('div');
				div.style.whiteSpace = 'nowrap';

				var hd = document.createElement('h3');
				mxUtils.write(hd, mxResources.get('formatVsdx'));
				hd.style.cssText = 'width:100%;text-align:center;margin-top:0px;margin-bottom:4px';
				div.appendChild(hd);
				
				var pages = editorUi.addCheckbox(div, mxResources.get('allPages'), !noPages, noPages);
				pages.style.marginBottom = '16px';
				
				var dlg = new CustomDialog(editorUi, div, mxUtils.bind(this, function()
				{
					editorUi.exportVisio(!pages.checked);
				}), null, mxResources.get('export'));
				
				editorUi.showDialog(dlg.container, 300, 130, true, true);
			}
		}));
		
		if (isLocalStorage && localStorage != null && urlParams['embed'] != '1')
		{
			editorUi.actions.addAction('configuration...', function()
			{
				// Add help, link button
				var value = localStorage.getItem(Editor.configurationKey);
				
				var buttons = [[mxResources.get('reset'), function(evt, input)
				{
					editorUi.confirm(mxResources.get('areYouSure'), function()
					{
						try
						{
							localStorage.removeItem(Editor.configurationKey);
							
							if (mxEvent.isShiftDown(evt))
							{
								localStorage.removeItem('.drawio-config');
								localStorage.removeItem('.mode');
							}
							
							editorUi.hideDialog();
							editorUi.alert(mxResources.get('restartForChangeRequired'));
						}
						catch (e)
						{
							editorUi.handleError(e);
						}
					});
				}]];
				
				if (!EditorUi.isElectronApp)
				{
					buttons.push([mxResources.get('formula'), function(evt, input)
					{
						if (input.value.length > 0)
						{
							try
							{
								var obj = JSON.parse(input.value);
								var url = window.location.protocol + '//' + window.location.host +
									'/' + editorUi.getSearch() + '#_CONFIG_' +
									Graph.compress(JSON.stringify(obj));
								var dlg = new EmbedDialog(editorUi, url);
								editorUi.showDialog(dlg.container, 450, 240, true);
								dlg.init();
							}
							catch (e)
							{
								editorUi.handleError(e);	
							}
						}
						else
						{
							editorUi.handleError({message: mxResources.get('invalidInput')});
						}
					}]);

					buttons.push([mxResources.get('saveData'), function(evt, input)
					{
						if (input.value.length > 0)
						{
							try
							{
								var obj = JSON.parse(input.value);
								var url = window.location.protocol + '//' + window.location.host +
									'/' + editorUi.getSearch() + '#_CONFIG_' +
									Graph.compress(JSON.stringify(obj));
								var dlg = new EmbedDialog(editorUi, url);
								editorUi.showDialog(dlg.container, 450, 240, true);
								dlg.init();
							}
							catch (e)
							{
								editorUi.handleError(e);	
							}
						}
						else
						{
							editorUi.handleError({message: mxResources.get('invalidInput')});
						}
					}]);

					buttons.push([mxResources.get('readData'), function(evt, input)
					{
						if (input.value.length > 0)
						{
							try
							{
								var obj = JSON.parse(input.value);
								var url = window.location.protocol + '//' + window.location.host +
									'/' + editorUi.getSearch() + '#_CONFIG_' +
									Graph.compress(JSON.stringify(obj));
								var dlg = new EmbedDialog(editorUi, url);
								editorUi.showDialog(dlg.container, 450, 240, true);
								dlg.init();
							}
							catch (e)
							{
								editorUi.handleError(e);	
							}
						}
						else
						{
							editorUi.handleError({message: mxResources.get('invalidInput')});
						}
					}]);
				}

		    	var dlg = new TextareaDialog(editorUi, mxResources.get('configuration') + ':',
		    		(value != null) ? JSON.stringify(JSON.parse(value), null, 2) : '', function(newValue)
				{
					if (newValue != null)
					{
						try
						{
							if (newValue.length > 0)
							{
								var obj = JSON.parse(newValue);
								
								localStorage.setItem(Editor.configurationKey, JSON.stringify(obj));
							}
							else
							{
								localStorage.removeItem(Editor.configurationKey);
							}

							editorUi.hideDialog();
							editorUi.alert(mxResources.get('restartForChangeRequired'));
						}
						catch (e)
						{
							editorUi.handleError(e);	
						}
					}
				}, null, null, null, null, null, true, null, null,
					'https://www.diagrams.net/doc/faq/configure-diagram-editor',
					buttons);
		    	
		    	dlg.textarea.style.width = '600px';
		    	dlg.textarea.style.height = '380px';
				editorUi.showDialog(dlg.container, 620, 460, true, false);
				dlg.init();
			});
		}
		
		// Adds language menu to options only if localStorage is available for
		// storing the choice. We do not want to use cookies for older browsers.
		// Note that the URL param lang=XX is available for setting the language
		// in older browsers. URL param has precedence over the saved setting.
		if (mxClient.IS_CHROMEAPP || isLocalStorage)
		{
			this.put('language', new Menu(mxUtils.bind(this, function(menu, parent)
			{
				var addLangItem = mxUtils.bind(this, function (id)
				{
					var lang = (id == '') ? mxResources.get('automatic') : mxLanguageMap[id];
					var item = null;
					
					if (lang != '')
					{
						item = menu.addItem(lang, null, mxUtils.bind(this, function()
						{
							mxSettings.setLanguage(id);
							mxSettings.save();
							
							// Shows dialog in new language
							mxClient.language = id;
							mxResources.loadDefaultBundle = false;
							mxResources.add(RESOURCE_BASE);
							
							editorUi.alert(mxResources.get('restartForChangeRequired'));
						}), parent);
						
						if (id == mxLanguage || (id == '' && mxLanguage == null))
						{
							menu.addCheckmark(item, Editor.checkmarkImage);
						}
					}
					
					return item;
				});
				
				var item = addLangItem('');
				menu.addSeparator(parent);

				// LATER: Sort menu by language name
				for(var langId in mxLanguageMap) 
				{
					addLangItem(langId);
				}
			})));

			// Extends the menubar with the language menu
			// var menusCreateMenuBar = Menus.prototype.createMenubar;
			// Menus.prototype.createMenubar = function(container)
			// {
			// 	var menubar = menusCreateMenuBar.apply(this, arguments);
				
			// 	if (menubar != null && urlParams['noLangIcon'] != '1')
			// 	{
			// 		var langMenu = this.get('language');
					
			// 		if (langMenu != null)
			// 		{
			// 			var elt = menubar.addMenu('', langMenu.funct);
			// 			elt.setAttribute('title', mxResources.get('language'));
			// 			elt.style.width = '16px';
			// 			elt.style.paddingTop = '2px';
			// 			elt.style.paddingLeft = '4px';
			// 			elt.style.zIndex = '1';
			// 			elt.style.position = 'absolute';
			// 			elt.style.display = 'block';
			// 			elt.style.cursor = 'pointer';
			// 			elt.style.right = '17px';
						
			// 			if (uiTheme == 'atlas')
			// 			{
			// 				elt.style.top = '6px';
			// 				elt.style.right = '15px';
			// 			}
			// 			else if (uiTheme == 'min')
			// 			{
			// 				elt.style.top = '2px';
			// 			}
			// 			else
			// 			{
			// 				elt.style.top = '0px';
			// 			}

			// 			var icon = document.createElement('div');
			// 			icon.style.backgroundImage = 'url(' + Editor.globeImage + ')';
			// 			icon.style.backgroundPosition = 'center center';
			// 			icon.style.backgroundRepeat = 'no-repeat';
			// 			icon.style.backgroundSize = '19px 19px';
			// 			icon.style.position = 'absolute';
			// 			icon.style.height = '19px';
			// 			icon.style.width = '19px';
			// 			icon.style.marginTop = '2px';
			// 			icon.style.zIndex = '1';
			// 			elt.appendChild(icon);
			// 			mxUtils.setOpacity(elt, 40);
						
			// 			if (uiTheme == 'atlas' || uiTheme == 'dark')
			// 			{
			// 				elt.style.opacity = '0.85';
			// 				elt.style.filter = 'invert(100%)';
			// 			}

			// 			document.body.appendChild(elt);
			// 		}
			// 	}

			// 	return menubar;
			// };
		}
		
		editorUi.customLayoutConfig = [{'layout': 'mxHierarchicalLayout',
			'config':
			{'orientation': 'west',
			'intraCellSpacing': 30,
			'interRankCellSpacing': 100,
			'interHierarchySpacing': 60,
			'parallelEdgeSpacing': 10}}];
		
		// Adds action
		editorUi.actions.addAction('runLayout', function()
		{
	    	var dlg = new TextareaDialog(editorUi, 'Run Layouts:',
	    		JSON.stringify(editorUi.customLayoutConfig, null, 2),
	    		function(newValue)
			{
				if (newValue.length > 0)
				{
					try
					{
						var layoutList = JSON.parse(newValue);
						editorUi.executeLayoutList(layoutList)
						editorUi.customLayoutConfig = layoutList;
					}
					catch (e)
					{
						editorUi.handleError(e);
						
						if (window.console != null)
						{
							console.error(e);
						}
					}
				}
			}, null, null, null, null, null, true, null, null,
				'https://www.diagrams.net/doc/faq/apply-layouts');
	    	
	    	dlg.textarea.style.width = '600px';
	    	dlg.textarea.style.height = '380px';
			editorUi.showDialog(dlg.container, 620, 460, true, true);
			dlg.init();
		});
		
		if (urlParams['customMenu'] != '1') {  // yanwx,定制菜单
			var layoutMenu = this.get('layout');
			var layoutMenuFunct = layoutMenu.funct;
			
			layoutMenu.funct = function(menu, parent)
			{
				layoutMenuFunct.apply(this, arguments);
	
				menu.addItem(mxResources.get('orgChart'), null, function()
				{
					var branchOptimizer = null, parentChildSpacingVal = 20, siblingSpacingVal = 20, notExecuted = true;
					
					// Invoked when orgchart code was loaded
					var delayed = function()
					{
						editorUi.loadingOrgChart = false;
						editorUi.spinner.stop();
						
						if (typeof mxOrgChartLayout !== 'undefined' && branchOptimizer != null && notExecuted)
						{
							var graph = editorUi.editor.graph;
							var orgChartLayout = new mxOrgChartLayout(graph, branchOptimizer, parentChildSpacingVal, siblingSpacingVal);
							
							var cell = graph.getDefaultParent();
							
							if (graph.model.getChildCount(graph.getSelectionCell()) > 1)
							{
								cell = graph.getSelectionCell();
							}
							
							orgChartLayout.execute(cell);
							notExecuted = false;
						}
					};
					
					// Invoked from dialog
					function doLayout()
					{
						if (typeof mxOrgChartLayout === 'undefined' && !editorUi.loadingOrgChart && !editorUi.isOffline(true))
						{
							if (editorUi.spinner.spin(document.body, mxResources.get('loading')))
							{
								editorUi.loadingOrgChart = true;
								
								if (urlParams['dev'] == '1')
								{
									mxscript('js/orgchart/bridge.min.js', function()
									{
										mxscript('js/orgchart/bridge.collections.min.js', function()
										{
											mxscript('js/orgchart/OrgChart.Layout.min.js', function()
											{
												mxscript('js/orgchart/mxOrgChartLayout.js', delayed);											
											});		
										});	
									});
								}
								else
								{
									mxscript('js/extensions.min.js', delayed);
								}
							}
						}
						else
						{
							delayed();
						}
					};
	
					var div = document.createElement('div');
					
					var title = document.createElement('div');
					title.style.marginTop = '6px';
					title.style.display = 'inline-block';
					title.style.width = '140px';
					mxUtils.write(title, mxResources.get('orgChartType') + ': ');
					
					div.appendChild(title);
					
					var typeSelect = document.createElement('select');
					typeSelect.style.width = '200px';
					typeSelect.style.boxSizing = 'border-box';
					
					//Types are hardcoded here since the code is not loaded yet
					var typesArr = [mxResources.get('linear'),
						mxResources.get('hanger2'),
						mxResources.get('hanger4'),
						mxResources.get('fishbone1'),
						mxResources.get('fishbone2'),
						mxResources.get('1ColumnLeft'),
						mxResources.get('1ColumnRight'),
						mxResources.get('smart')
					];
					
					for (var i = 0; i < typesArr.length; i++)
					{
						var option = document.createElement('option');
						mxUtils.write(option, typesArr[i]);
						option.value = i;
						
						if (i == 2)
						{
							option.setAttribute('selected', 'selected');
						}
						
						typeSelect.appendChild(option);
					}
						
					mxEvent.addListener(typeSelect, 'change', function()
					{
						branchOptimizer = typeSelect.value;
					});
					
					div.appendChild(typeSelect);
					
					title = document.createElement('div');
					title.style.marginTop = '6px';
					title.style.display = 'inline-block';
					title.style.width = '140px';
					mxUtils.write(title, mxResources.get('parentChildSpacing') + ': ');
					div.appendChild(title);
					
					var parentChildSpacing = document.createElement('input');
					parentChildSpacing.type = 'number';
					parentChildSpacing.value = parentChildSpacingVal;
					parentChildSpacing.style.width = '200px';
					parentChildSpacing.style.boxSizing = 'border-box';
					div.appendChild(parentChildSpacing);
					
					mxEvent.addListener(parentChildSpacing, 'change', function()
					{
						parentChildSpacingVal = parentChildSpacing.value;
					});
					
					title = document.createElement('div');
					title.style.marginTop = '6px';
					title.style.display = 'inline-block';
					title.style.width = '140px';
					mxUtils.write(title, mxResources.get('siblingSpacing') + ': ');
					div.appendChild(title);
					
					var siblingSpacing = document.createElement('input');
					siblingSpacing.type = 'number';
					siblingSpacing.value = siblingSpacingVal;
					siblingSpacing.style.width = '200px';
					siblingSpacing.style.boxSizing = 'border-box';
					div.appendChild(siblingSpacing);
					
					mxEvent.addListener(siblingSpacing, 'change', function()
					{
						siblingSpacingVal = siblingSpacing.value;
					});
					
					var dlg = new CustomDialog(editorUi, div, function()
					{
						if (branchOptimizer == null)
						{
							branchOptimizer = 2;
						}
						
						doLayout();
					});
					
					editorUi.showDialog(dlg.container, 355, 140, true, true);
				}, parent, null, isGraphEnabled());
							
				menu.addSeparator(parent);
			
				menu.addItem(mxResources.get('parallels'), null, mxUtils.bind(this, function()
				{
					// Keeps parallel edges apart
					var layout = new mxParallelEdgeLayout(graph);
					layout.checkOverlap = true;
					layout.spacing = 20;
					
					editorUi.executeLayout(function()
					{
						layout.execute(graph.getDefaultParent(), (!graph.isSelectionEmpty()) ?
							graph.getSelectionCells() : null);
					}, false);
				}), parent);
				
				menu.addSeparator(parent);
				editorUi.menus.addMenuItem(menu, 'runLayout', parent, null, null, mxResources.get('apply') + '...');
			};
		}
		
		this.put('help', new Menu(mxUtils.bind(this, function(menu, parent)
		{
			if (!mxClient.IS_CHROMEAPP && editorUi.isOffline())
			{
				this.addMenuItems(menu, ['about'], parent);
			}
			else
			{
				// No translation for menu item since help is english only
				var item = menu.addItem('Search:', null, null, parent, null, null, false);
				item.style.backgroundColor = Editor.isDarkMode() ? '#505759' : 'whiteSmoke';
				item.style.cursor = 'default';
				
				var input = document.createElement('input');
				input.setAttribute('type', 'text');
				input.setAttribute('size', '25');
				input.style.marginLeft = '8px';

				mxEvent.addListener(input, 'keydown', mxUtils.bind(this, function(e)
				{
					var term = mxUtils.trim(input.value);
					
					if (e.keyCode == 13 && term.length > 0)
					{
						this.editorUi.openLink('https://www.diagrams.net/search?src=' +
							EditorUi.isElectronApp? 'DESKTOP' : encodeURIComponent(location.host) + 
							'&search=' + encodeURIComponent(term));
						input.value = '';
						EditorUi.logEvent({category: 'SEARCH-HELP', action: 'search', label: term});
						
						window.setTimeout(mxUtils.bind(this, function()
						{
							this.editorUi.hideCurrentMenu();
						}), 0);
					}
	                else if (e.keyCode == 27)
	                {
	                    input.value = '';
	                }
				}));
				
				item.firstChild.nextSibling.appendChild(input);
				
				mxEvent.addGestureListeners(input, function(evt)
				{
					if (document.activeElement != input)
					{
						input.focus();
					}
					
					mxEvent.consume(evt);
				}, function(evt)
				{
					mxEvent.consume(evt);
				}, function(evt)
				{
					mxEvent.consume(evt);
				});
				
				window.setTimeout(function()
				{
					input.focus();
				}, 0);

				if (EditorUi.isElectronApp) {
					// yanwx
					console.log('electron help menu');
					this.addMenuItems(menu, ['-', 'keyboardShortcuts', 'quickStart', 'support', '-', 'forkme', '-', 'about'], parent);
				}
				else {
					// yanwx, 删除Fork me 和 获取桌面版本
					// this.addMenuItems(menu, ['-', 'keyboardShortcuts', 'quickStart', 'support', '-', 'forkme', 'downloadDesktop', '-', 'about'], parent);
					this.addMenuItems(menu, ['-', 'keyboardShortcuts', 'quickStart', 'support', '-',  'about'], parent);
				}
			}
			
			if (urlParams['test'] == '1')
			{
				menu.addSeparator(parent);
				this.addSubmenu('testDevelop', menu, parent);
			}
		})));

		// Experimental
		mxResources.parse('diagramLanguage=Diagram Language');
		editorUi.actions.addAction('diagramLanguage...', function()
		{
			var lang = prompt('Language Code', Graph.diagramLanguage || '');
			
			if (lang != null)
			{
				Graph.diagramLanguage = (lang.length > 0) ? lang : null;
				graph.refresh();
			}
		});
		
		// Only visible in test mode
		if (urlParams['test'] == '1')
		{
			mxResources.parse('testDevelop=Develop');
			mxResources.parse('showBoundingBox=Show bounding box');
			mxResources.parse('createSidebarEntry=Create Sidebar Entry');
			mxResources.parse('testCheckFile=Check File');
			mxResources.parse('testDiff=Diff/Sync');
			mxResources.parse('testInspect=Inspect');
			mxResources.parse('testShowConsole=Show Console');
			mxResources.parse('testXmlImageExport=XML Image Export');
			mxResources.parse('testDownloadRtModel=Export RT model');
			mxResources.parse('testImportRtModel=Import RT model');

			editorUi.actions.addAction('createSidebarEntry', mxUtils.bind(this, function()
			{
				if (!graph.isSelectionEmpty())
				{
					var cells = graph.cloneCells(graph.getSelectionCells());
					var bbox = graph.getBoundingBoxFromGeometry(cells);
					cells = graph.moveCells(cells, -bbox.x, -bbox.y);
					
					editorUi.showTextDialog('Create Sidebar Entry', 'this.addDataEntry(\'tag1 tag2\', ' +
						bbox.width + ', ' + bbox.height + ', \'The Title\', \'' +
						Graph.compress(mxUtils.getXml(graph.encodeCells(cells))) + '\'),');
				}
			}));
	
			editorUi.actions.addAction('showBoundingBox', mxUtils.bind(this, function()
			{
				var b = graph.getGraphBounds();
				var tr = graph.view.translate;
				var s = graph.view.scale;
				graph.insertVertex(graph.getDefaultParent(), null, '',
					b.x / s - tr.x, b.y / s - tr.y, b.width / s, b.height / s,
					'fillColor=none;strokeColor=red;');
			}));
	
			editorUi.actions.addAction('testCheckFile', mxUtils.bind(this, function()
			{
				var xml = (editorUi.pages != null && editorUi.getCurrentFile() != null) ?
					editorUi.getCurrentFile().getAnonymizedXmlForPages(editorUi.pages) : '';

		    	var dlg = new TextareaDialog(editorUi, 'Paste Data:', xml,
		    		function(newValue)
				{
					if (newValue.length > 0)
					{
						try
						{
							if (newValue.charAt(0) != '<')
							{
								newValue = Graph.decompress(newValue);
								mxLog.debug('See console for uncompressed XML');
								console.log('xml', newValue);
							}
							
							var doc = mxUtils.parseXml(newValue);
							var pages = editorUi.getPagesForNode(doc.documentElement, 'mxGraphModel');
							
							if (pages != null && pages.length > 0)
							{
								try
								{
									var checksum = editorUi.getHashValueForPages(pages);
									mxLog.debug('Checksum: ', checksum);
								}
								catch (e)
								{
									mxLog.debug('Error: ', e.message);
								}
							}
							else
							{
								mxLog.debug('No pages found for checksum');
							}

							// Checks for duplicates
							function checkModel(node)
							{
								var pageId = node.parentNode.id;
								var all = node.childNodes;
								var allIds = {};
								var childs = {};
								var root = null;
								var dups = {};
								
								for (var i = 0; i < all.length; i++)
								{
									var el = all[i];
									
									if (el.id != null && el.id.length > 0)
									{
										if (allIds[el.id] == null)
										{
											allIds[el.id] = el.id;
											var pid = el.getAttribute('parent');
											
											if (pid == null)
											{
												if (root != null)
												{
													mxLog.debug(pageId + ': Multiple roots: ' + el.id);
												}
												else
												{
													root = el.id;
												}
											}
											else
											{
												if (childs[pid] == null)
												{
													childs[pid] = [];
												}
												
												childs[pid].push(el.id);
											}
										}
										else
										{
											dups[el.id] = el.id;
										}
									}
								}
								
								if (Object.keys(dups).length > 0)
								{
									var log = pageId + ': ' + Object.keys(dups).length + ' Duplicates: ' + Object.keys(dups).join(', ');
									mxLog.debug(log + ' (see console)');
								}
								else
								{
									mxLog.debug(pageId + ': Checked');
								}
								
								// Checks tree for cycles
								var visited = {};
								
								function visit(id)
								{
									if (visited[id] == null)
									{
										visited[id] = true;
										
										if (childs[id] != null)
										{
											while (childs[id].length > 0)
											{
												var temp = childs[id].pop();
												visit(temp);
											}
											
											delete childs[id];
										}
									}
									else
									{
										mxLog.debug(pageId + ': Visited: ' + id);
									}
								};
								
								if (root == null)
								{
									mxLog.debug(pageId + ': No root');
								}
								else
								{
									visit(root);
									
									if (Object.keys(visited).length != Object.keys(allIds).length)
									{
										mxLog.debug(pageId + ': Invalid tree: (see console)');
										console.log(pageId + ': Invalid tree', childs);
									}
								}
							};
							
							var roots = doc.getElementsByTagName('root');
							
							for (var i = 0; i < roots.length; i++)
							{
								checkModel(roots[i]);
							}
							
							mxLog.show();
						}
						catch (e)
						{
							editorUi.handleError(e);
							
							if (window.console != null)
							{
								console.error(e);
							}
						}
					}
				});
		    	
		    	dlg.textarea.style.width = '600px';
		    	dlg.textarea.style.height = '380px';
				editorUi.showDialog(dlg.container, 620, 460, true, true);
				dlg.init();
			}));
	
			var snapshot = null;
			
			editorUi.actions.addAction('testDiff', mxUtils.bind(this, function()
			{
				if (editorUi.pages != null)
				{
					var buttons = [['Snapshot', function(evt, input)
					{
						snapshot = editorUi.getPagesForNode(mxUtils.parseXml(
							editorUi.getFileData(true)).documentElement);
						dlg.textarea.value = 'Snapshot updated ' + new Date().toLocaleString();
					}], ['Diff', function(evt, input)
					{
						try
						{
							dlg.textarea.value = JSON.stringify(editorUi.diffPages(
								snapshot, editorUi.pages), null, 2);
						}
						catch (e)
						{
							editorUi.handleError(e);
						}
					}]];
					
			    	var dlg = new TextareaDialog(editorUi, 'Diff/Sync:', '',
			    		function(newValue)
					{
						var file = editorUi.getCurrentFile();
						
						if (newValue.length > 0 && file != null)
						{
							try
							{
								var patch = JSON.parse(newValue);
								file.patch([patch], null, true);
								editorUi.hideDialog();
							}
							catch (e)
							{
								editorUi.handleError(e);
							}
						}
					}, null, 'Close', null, null, null, true, null, 'Patch', null, buttons);
			    	
			    	dlg.textarea.style.width = '600px';
			    	dlg.textarea.style.height = '380px';


					if (snapshot == null)
					{
						snapshot = editorUi.getPagesForNode(mxUtils.parseXml(
							editorUi.getFileData(true)).documentElement);
						dlg.textarea.value = 'Snapshot created ' + new Date().toLocaleString();
					}
					else
					{
						dlg.textarea.value = JSON.stringify(editorUi.diffPages(
							snapshot, editorUi.pages), null, 2);
					}
					
					editorUi.showDialog(dlg.container, 620, 460, true, true);
					dlg.init();
				}
				else
				{
					editorUi.alert('No pages');
				}
			}));
	
			editorUi.actions.addAction('testInspect', mxUtils.bind(this, function()
			{
				console.log(editorUi, graph.getModel());
			}));
			
			editorUi.actions.addAction('testXmlImageExport', mxUtils.bind(this, function()
			{
				var bg = '#ffffff';
				var scale = 1;
				var b = 1;
				
				var imgExport = new mxImageExport();
				var bounds = graph.getGraphBounds();
				var vs = graph.view.scale;
				
	        	// New image export
				var xmlDoc = mxUtils.createXmlDocument();
				var root = xmlDoc.createElement('output');
				xmlDoc.appendChild(root);
				
			    // Renders graph. Offset will be multiplied with state's scale when painting state.
				var xmlCanvas = new mxXmlCanvas2D(root);
				xmlCanvas.translate(Math.floor((b / scale - bounds.x) / vs), Math.floor((b / scale - bounds.y) / vs));
				xmlCanvas.scale(scale / vs);
				
				var stateCounter = 0;
				
				var canvasSave = xmlCanvas.save;
				xmlCanvas.save = function()
				{
					stateCounter++;
					canvasSave.apply(this, arguments);
				};
				
				var canvasRestore = xmlCanvas.restore;
				xmlCanvas.restore = function()
				{
					stateCounter--;
					canvasRestore.apply(this, arguments);
				};
				
				var exportDrawShape = imgExport.drawShape;
				imgExport.drawShape = function(state)
				{
					mxLog.debug('entering shape', state, stateCounter);
					exportDrawShape.apply(this, arguments);
					mxLog.debug('leaving shape', state, stateCounter);
				};
				
			    imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);
			    
				// Puts request data together
				var w = Math.ceil(bounds.width * scale / vs + 2 * b);
				var h = Math.ceil(bounds.height * scale / vs + 2 * b);
				
				mxLog.show();
				mxLog.debug(mxUtils.getXml(root));
				mxLog.debug('stateCounter', stateCounter);
			}));

			editorUi.actions.addAction('testShowConsole', function()
			{
				if (!mxLog.isVisible())
				{
					mxLog.show();
				}
				else
				{
					mxLog.window.fit();
				}
				
				mxLog.window.div.style.zIndex = mxPopupMenu.prototype.zIndex - 2;
			});
			
			this.put('testDevelop', new Menu(mxUtils.bind(this, function(menu, parent)
			{
				this.addMenuItems(menu, ['createSidebarEntry', 'showBoundingBox', '-',
					'testCheckFile', 'testDiff', '-', 'testInspect', '-',
					'testXmlImageExport', '-', 'testShowConsole'], parent);
			})));
		}

		editorUi.actions.addAction('shapes...', function()
		{
			if (mxClient.IS_CHROMEAPP || !editorUi.isOffline())
			{
				editorUi.showDialog(new MoreShapesDialog(editorUi, true).container, 640, (isLocalStorage) ?
						((mxClient.IS_IOS) ? 480 : 460) : 440, true, true);
			}
			else
			{
				editorUi.showDialog(new MoreShapesDialog(editorUi, false).container, 360, (isLocalStorage) ?
						((mxClient.IS_IOS) ? 300 : 280) : 260, true, true);
			}
		});

		editorUi.actions.put('createShape', new Action(mxResources.get('shape') + '...', function(evt)
		{
			if (graph.isEnabled())
			{
				var cell = new mxCell('', new mxGeometry(0, 0, 120, 120), editorUi.defaultCustomShapeStyle);
				cell.vertex = true;
			
		    	var dlg = new EditShapeDialog(editorUi, cell, mxResources.get('editShape') + ':', 630, 400);
				editorUi.showDialog(dlg.container, 640, 480, true, false);
				dlg.init();
			}
		})).isEnabled = isGraphEnabled;
		
		editorUi.actions.put('embedHtml', new Action(mxResources.get('html') + '...', function()
		{
			if (editorUi.spinner.spin(document.body, mxResources.get('loading')))
			{
				editorUi.getPublicUrl(editorUi.getCurrentFile(), function(url)
				{
					editorUi.spinner.stop();
					
					editorUi.showHtmlDialog(mxResources.get('create'), 'https://www.diagrams.net/doc/faq/embed-html-options',
						url, function(publicUrl, zoomEnabled, initialZoom, linkTarget, linkColor, fit, allPages, layers, tags, lightbox, editLink)
					{
						editorUi.createHtml(publicUrl, zoomEnabled, initialZoom, linkTarget, linkColor, fit, allPages,
							layers, tags, lightbox, editLink, mxUtils.bind(this, function(html, scriptTag)
							{
								var dlg = new EmbedDialog(editorUi, html + '\n' + scriptTag, null, null, function()
								{
									var wnd = window.open();
									var doc = wnd.document;
									
									if (doc != null)
									{
										if (document.compatMode === 'CSS1Compat')
										{
											doc.writeln('<!DOCTYPE html>');
										}
										
										doc.writeln('<html>');
										doc.writeln('<head><title>' + encodeURIComponent(mxResources.get('preview')) +
											'</title><meta charset="utf-8"></head>');
										doc.writeln('<body>');
										doc.writeln(html);
										
										var direct = mxClient.IS_IE || mxClient.IS_EDGE || document.documentMode != null;
										
										if (direct)
										{
											doc.writeln(scriptTag);
										}
										
										doc.writeln('</body>');
										doc.writeln('</html>');
										doc.close();
										
										// Adds script tag after closing page and delay to fix timing issues
										if (!direct)
										{
											var info = wnd.document.createElement('div');
											info.marginLeft = '26px';
											info.marginTop = '26px';
											mxUtils.write(info, mxResources.get('updatingDocument'));
	
											var img = wnd.document.createElement('img');
											img.setAttribute('src', window.location.protocol + '//' + window.location.hostname +
												'/' + IMAGE_PATH + '/spin.gif');
											img.style.marginLeft = '6px';
											info.appendChild(img);
											
											wnd.document.body.insertBefore(info, wnd.document.body.firstChild);
											
											window.setTimeout(function()
											{
												var script = document.createElement('script');
												script.type = 'text/javascript';
												script.src = /<script.*?src="(.*?)"/.exec(scriptTag)[1];
												doc.body.appendChild(script);
												
												info.parentNode.removeChild(info);
											}, 20);
										}
									}
									else
									{
										editorUi.handleError({message: mxResources.get('errorUpdatingPreview')});
									}
								});
								editorUi.showDialog(dlg.container, 450, 240, true, true);
								dlg.init();
							}));
					});
				});
			}
		}));
		
		editorUi.actions.put('liveImage', new Action('Live image...', function()
		{
			var current = editorUi.getCurrentFile();
			
			if (current != null && editorUi.spinner.spin(document.body, mxResources.get('loading')))
			{
				editorUi.getPublicUrl(editorUi.getCurrentFile(), function(url)
				{
					editorUi.spinner.stop();
					
					if (url != null)
					{
						var dlg = new EmbedDialog(editorUi, '<img src="' + ((current.constructor != DriveFile) ?
							url : 'https://drive.google.com/uc?id=' + current.getId()) + '"/>');
						editorUi.showDialog(dlg.container, 450, 240, true, true);
						dlg.init();
					}
					else
					{
						editorUi.handleError({message: mxResources.get('invalidPublicUrl')});
					}
				});
			}
		}));
		
		if (urlParams['customMenu'] != '1') { // yanwx, 1定制菜单
			editorUi.actions.put('embedImage', new Action(mxResources.get('image') + '...', function()
			{
				editorUi.showEmbedImageDialog(function(fit, shadow, retina, lightbox, editLink, layers)
				{
					if (editorUi.spinner.spin(document.body, mxResources.get('loading')))
					{
						editorUi.createEmbedImage(fit, shadow, retina, lightbox, editLink, layers, function(result)
						{
							editorUi.spinner.stop();
							var dlg = new EmbedDialog(editorUi, result);
							editorUi.showDialog(dlg.container, 450, 240, true, true);
							dlg.init();
						}, function(err)
						{
							editorUi.spinner.stop();
							editorUi.handleError(err);
						});
					}
				}, mxResources.get('image'), mxResources.get('retina'), editorUi.isExportToCanvas());
			}));
		}
		editorUi.actions.put('embedSvg', new Action(mxResources.get('formatSvg') + '...', function()
		{
			editorUi.showEmbedImageDialog(function(fit, shadow, image, lightbox, editLink, layers)
			{
				if (editorUi.spinner.spin(document.body, mxResources.get('loading')))
				{
					editorUi.createEmbedSvg(fit, shadow, image, lightbox, editLink, layers, function(result)
					{
						editorUi.spinner.stop();
						
						var dlg = new EmbedDialog(editorUi, result);
						editorUi.showDialog(dlg.container, 450, 240, true, true);
						dlg.init();
					}, function(err)
					{
						editorUi.spinner.stop();
						editorUi.handleError(err);
					});
				}
			}, mxResources.get('formatSvg'), mxResources.get('image'),
				true, 'https://www.diagrams.net/doc/faq/embed-svg.html');
		}));
		
		editorUi.actions.put('embedIframe', new Action(mxResources.get('iframe') + '...', function()
		{
			var bounds = graph.getGraphBounds();
			
			editorUi.showPublishLinkDialog(mxResources.get('iframe'), null, '100%',
				Math.ceil(bounds.height / graph.view.scale) + 2,
				function(linkTarget, linkColor, allPages, lightbox, editLink, layers, width, height, tags)
			{
				if (editorUi.spinner.spin(document.body, mxResources.get('loading')))
				{
					editorUi.getPublicUrl(editorUi.getCurrentFile(), function(url)
					{
						editorUi.spinner.stop();
						var params = [];

						if (tags)
						{
							params.push('tags=%7B%7D');
						}
						
						var dlg = new EmbedDialog(editorUi, '<iframe frameborder="0" style="width:' + width +
							';height:' + height + ';" src="' + editorUi.createLink(linkTarget, linkColor,
							allPages, lightbox, editLink, layers, url, null, params) + '"></iframe>');
						editorUi.showDialog(dlg.container, 450, 240, true, true);
						dlg.init();
					});
				}
			}, true);
		}));

		editorUi.actions.put('embedNotion', new Action(mxResources.get('notion') + '...', function()
		{
			editorUi.showPublishLinkDialog(mxResources.get('notion'), null, null, null,
				function(linkTarget, linkColor, allPages, lightbox, editLink, layers, width, height, tags)
			{
				if (editorUi.spinner.spin(document.body, mxResources.get('loading')))
				{
					editorUi.getPublicUrl(editorUi.getCurrentFile(), function(url)
					{
						editorUi.spinner.stop();
						var params = ['border=0'];

						if (tags)
						{
							params.push('tags=%7B%7D');
						}

						var dlg = new EmbedDialog(editorUi, editorUi.createLink(linkTarget, linkColor,
							allPages, lightbox, editLink, layers, url, null, params, true));
						editorUi.showDialog(dlg.container, 450, 240, true, true);
						dlg.init();
					});
				}
			}, true);
		}));
		
		editorUi.actions.put('publishLink', new Action(mxResources.get('link') + '...', function()
		{
			editorUi.showPublishLinkDialog(null, null, null, null,
				function(linkTarget, linkColor, allPages, lightbox, editLink, layers, width, height, tags)
			{
				if (editorUi.spinner.spin(document.body, mxResources.get('loading')))
				{
					editorUi.getPublicUrl(editorUi.getCurrentFile(), function(url)
					{
						editorUi.spinner.stop();
						
						var params = [];

						if (tags)
						{
							params.push('tags=%7B%7D');
						}

						var dlg = new EmbedDialog(editorUi, editorUi.createLink(linkTarget, linkColor,
							allPages, lightbox, editLink, layers, url, null, params));
						editorUi.showDialog(dlg.container, 450, 240, true, true);
						dlg.init();
					});
				}
			});
		}));

		editorUi.actions.addAction('microsoftOffice...', function()
		{
			editorUi.openLink('https://office.draw.io');
		});

		editorUi.actions.addAction('googleDocs...', function()
		{
			editorUi.openLink('http://docsaddon.draw.io');
		});

		editorUi.actions.addAction('googleSlides...', function()
		{
			editorUi.openLink('https://slidesaddon.draw.io');
		});

		editorUi.actions.addAction('googleSheets...', function()
		{
			editorUi.openLink('https://sheetsaddon.draw.io');
		});

		editorUi.actions.addAction('googleSites...', function()
		{
			if (editorUi.spinner.spin(document.body, mxResources.get('loading')))
			{
				editorUi.getPublicUrl(editorUi.getCurrentFile(), function(url)
				{
					editorUi.spinner.stop();
					var dlg = new GoogleSitesDialog(editorUi, url);
					editorUi.showDialog(dlg.container, 420, 256, true, true);
					dlg.init();
				});
			}
		});

		// Adds plugins menu item only if localStorage is available for storing the plugins
		if (isLocalStorage || mxClient.IS_CHROMEAPP)
		{
			var action = editorUi.actions.addAction('scratchpad', function()
			{
				editorUi.toggleScratchpad();
			});
			
			action.setToggleAction(true);
			action.setSelectedCallback(function()
			{
				return editorUi.scratchpad != null;
			});
			
			if (urlParams['plugins'] != '0')
			{
				editorUi.actions.addAction('plugins...', function()
				{
					editorUi.showDialog(new PluginsDialog(editorUi).container, 360, 170, true, false);
				});
			}
		}
		
		var action = editorUi.actions.addAction('search', function()
		{
			var visible = editorUi.sidebar.isEntryVisible('search');
			editorUi.sidebar.showPalette('search', !visible);
			if (isLocalStorage){
				mxSettings.settings.search = !visible;
				mxSettings.save();
			}
		});

		action.label = mxResources.get('searchShapes');  // '搜索图形'
		action.setToggleAction(true);
		action.setSelectedCallback(function() { return editorUi.sidebar.isEntryVisible('search'); });
		if (urlParams['customMenu'] == '1') {  // yanwx, 定制菜单，不显示
			action.setEnabled(false);
		}

		if (urlParams['embed'] == '1')
		{
			editorUi.actions.get('save').funct = function(exit)
			{
				if (graph.isEditing())
				{
					graph.stopEditing();
				}
				
				var data = (urlParams['pages'] != '0' || (editorUi.pages != null && editorUi.pages.length > 1)) ?
					editorUi.getFileData(true) : mxUtils.getXml(editorUi.editor.getGraphXml());
				
				if (urlParams['proto'] == 'json')
				{
					var msg = editorUi.createLoadMessage('save');
					msg.xml = data;
					
					if (exit)
					{
						msg.exit = true;
					}
					
					data = JSON.stringify(msg);
				}
				
				var parent = window.opener || window.parent;
				parent.postMessage(data, '*');
				
				if (urlParams['modified'] != '0' && urlParams['keepmodified'] != '1')
				{
					editorUi.editor.modified = false;
					editorUi.editor.setStatus('');
				}
				
				//Add support to saving files if embedded mode is running with files
				var file = editorUi.getCurrentFile();
				
				if (file != null && file.constructor != EmbedFile && (file.constructor != LocalFile || file.mode != null))
				{
					editorUi.saveFile();
				}
			};
	
			var saveAndExitAction = editorUi.actions.addAction('saveAndExit', function()
			{
				editorUi.actions.get('save').funct(true);
			});
			
			saveAndExitAction.label = urlParams['publishClose'] == '1' ? mxResources.get('publish') : mxResources.get('saveAndExit');
			
			editorUi.actions.addAction('exit', function()
			{
				if (urlParams['embedInline'] == '1')
				{
					editorUi.sendEmbeddedSvgExport();
				}
				else
				{
					var fn = function()
					{
						editorUi.editor.modified = false;
						var msg = (urlParams['proto'] == 'json') ? JSON.stringify({event: 'exit',
							modified: editorUi.editor.modified}) : '';
						var parent = window.opener || window.parent;
						parent.postMessage(msg, '*');
					}
					
					if (!editorUi.editor.modified)
					{
						fn();
					}
					else
					{
						editorUi.confirm(mxResources.get('allChangesLost'), null, fn,
							mxResources.get('cancel'), mxResources.get('discardChanges'));
					}
				}
			});
		}
		
		this.put('exportAs', new Menu(mxUtils.bind(this, function(menu, parent)
		{
			if (editorUi.isExportToCanvas())
			{
				this.addMenuItems(menu, ['exportPng'], parent);
				
				if (editorUi.jpgSupported)
				{
					this.addMenuItems(menu, ['exportJpg'], parent);
				}
			}
			
			// Disabled for standalone mode in iOS because new tab cannot be closed
			else if (!editorUi.isOffline() && (!mxClient.IS_IOS || !navigator.standalone))
			{
				this.addMenuItems(menu, ['exportPng', 'exportJpg'], parent);
			}
			
			this.addMenuItems(menu, ['exportSvg', '-'], parent);
			
			// yanwx, 删除 导出为 -> pdf 功能
			// Redirects export to PDF to print in Chrome App
			if (editorUi.isOffline() || editorUi.printPdfExport)
			{
				this.addMenuItems(menu, ['exportPdf'], parent);
			}
			// Disabled for standalone mode in iOS because new tab cannot be closed
			else if (!editorUi.isOffline() && (!mxClient.IS_IOS || !navigator.standalone))
			{
				this.addMenuItems(menu, ['exportPdf'], parent);
			}

			if (!mxClient.IS_IE && (typeof(VsdxExport) !== 'undefined' || !editorUi.isOffline()))
			{
				this.addMenuItems(menu, ['exportVsdx'], parent);
			}

			this.addMenuItems(menu, ['-', 'exportHtml', 'exportXml', 'exportUrl'], parent);

			if (!editorUi.isOffline())
			{
				menu.addSeparator(parent);
				this.addMenuItem(menu, 'export', parent).firstChild.nextSibling.innerHTML = mxResources.get('advanced') + '...';
			}
		})));

		this.put('importFrom', new Menu(mxUtils.bind(this, function(menu, parent)
		{
			var doImportFile = mxUtils.bind(this, function(data, mime, filename)
			{
				// Gets insert location
				var view = graph.view;
				var bds = graph.getGraphBounds();
				var x = graph.snap(Math.ceil(Math.max(0, bds.x / view.scale - view.translate.x) + 4 * graph.gridSize));
				var y = graph.snap(Math.ceil(Math.max(0, (bds.y + bds.height) / view.scale - view.translate.y) + 4 * graph.gridSize));

				if (data.substring(0, 11) == 'data:image/')
				{
					editorUi.loadImage(data, mxUtils.bind(this, function(img)
	    			{
			    		var resizeImages = true;
			    		
			    		var doInsert = mxUtils.bind(this, function()
			    		{
		    				editorUi.resizeImage(img, data, mxUtils.bind(this, function(data2, w2, h2)
	    	    			{
	    		    			var s = (resizeImages) ? Math.min(1, Math.min(editorUi.maxImageSize / w2, editorUi.maxImageSize / h2)) : 1;
	
    							editorUi.importFile(data, mime, x, y, Math.round(w2 * s), Math.round(h2 * s), filename, function(cells)
    							{
    								editorUi.spinner.stop();
    								graph.setSelectionCells(cells);
    								graph.scrollCellToVisible(graph.getSelectionCell());
    							});
	    	    			}), resizeImages);
			    		});
			    		
			    		if (data.length > editorUi.resampleThreshold)
			    		{
			    			editorUi.confirmImageResize(function(doResize)
	    					{
	    						resizeImages = doResize;
	    						doInsert();
	    					});
			    		}
			    		else
		    			{
			    			doInsert();
		    			}
	    			}), mxUtils.bind(this, function()
	    			{
	    				editorUi.handleError({message: mxResources.get('cannotOpenFile')});
	    			}));
				}
				else
				{
					editorUi.importFile(data, mime, x, y, 0, 0, filename, function(cells)
					{
						editorUi.spinner.stop();
						graph.setSelectionCells(cells);
						graph.scrollCellToVisible(graph.getSelectionCell());
					});
				}
			});
			
			var getMimeType = mxUtils.bind(this, function(filename)
			{
				var mime = 'text/xml';
				
				if (/\.png$/i.test(filename))
				{
					mime = 'image/png';
				}
				else if (/\.jpe?g$/i.test(filename))
				{
					mime = 'image/jpg';
				}
				else if (/\.gif$/i.test(filename))
				{
					mime = 'image/gif';
				}
				else if (/\.pdf$/i.test(filename))
				{
					mime = 'application/pdf';
				}
				
				return mime;
			});
			
			function pickFileFromService(service)
			{
				// Drive requires special arguments for libraries and bypassing realtime
				service.pickFile(function(id)
				{
					if (editorUi.spinner.spin(document.body, mxResources.get('loading')))
					{
						// NOTE The third argument in getFile says denyConvert to match
						// the existing signature in the original DriveClient which has
						// as slightly different semantic, but works the same way.
						service.getFile(id, function(file)
						{
							var mime = (file.getData().substring(0, 11) == 'data:image/') ? getMimeType(file.getTitle()) : 'text/xml';
							
							// Imports SVG as images
							if (/\.svg$/i.test(file.getTitle()) && !editorUi.editor.isDataSvg(file.getData()))
							{
								file.setData(Editor.createSvgDataUri(file.getData()));
								mime = 'image/svg+xml';
							}
							
							doImportFile(file.getData(), mime, file.getTitle());
						},
						function(resp)
						{
							editorUi.handleError(resp, (resp != null) ? mxResources.get('errorLoadingFile') : null);
						}, service == editorUi.drive);
					}
				}, true);
			};
		
			if (typeof(google) != 'undefined' && typeof(google.picker) != 'undefined')
			{
				if (editorUi.drive != null)
				{
					// Requires special arguments for libraries and realtime
					menu.addItem(mxResources.get('googleDrive') + '...', null, function()
					{
						pickFileFromService(editorUi.drive);
					}, parent);
				}
				else if (googleEnabled && typeof window.DriveClient === 'function')
				{
					menu.addItem(mxResources.get('googleDrive') + ' (' + mxResources.get('loading') + '...)', null, function()
					{
						// do nothing
					}, parent, null, false);
				}
			}

			if (editorUi.oneDrive != null)
			{
				menu.addItem(mxResources.get('oneDrive') + '...', null, function()
				{
					pickFileFromService(editorUi.oneDrive);
				}, parent);
			}
			else if (oneDriveEnabled && typeof window.OneDriveClient === 'function')
			{
				menu.addItem(mxResources.get('oneDrive') + ' (' + mxResources.get('loading') + '...)', null, function()
				{
					// do nothing
				}, parent, null, false);
			}

			if (editorUi.dropbox != null)
			{
				menu.addItem(mxResources.get('dropbox') + '...', null, function()
				{
					pickFileFromService(editorUi.dropbox);
				}, parent);
			}
			else if (dropboxEnabled && typeof window.DropboxClient === 'function')
			{
				menu.addItem(mxResources.get('dropbox') + ' (' + mxResources.get('loading') + '...)', null, function()
				{
					// do nothing
				}, parent, null, false);
			}
			
			menu.addSeparator(parent);
			
			if (editorUi.gitHub != null)
			{
				menu.addItem(mxResources.get('github') + '...', null, function()
				{
					pickFileFromService(editorUi.gitHub);
				}, parent);
			}
			
			if (editorUi.gitLab != null)
			{
				menu.addItem(mxResources.get('gitlab') + '...', null, function()
				{
					pickFileFromService(editorUi.gitLab);
				}, parent);
			}

			if (editorUi.notion != null)
			{
				menu.addSeparator(parent);
				menu.addItem(mxResources.get('notion') + '...', null, function()
				{
					pickFileFromService(editorUi.notion);
				}, parent);
			}

			if (editorUi.trello != null)
			{
				menu.addItem(mxResources.get('trello') + '...', null, function()
				{
					pickFileFromService(editorUi.trello);
				}, parent);
			}
			else if (trelloEnabled && typeof window.TrelloClient === 'function')
			{
				menu.addItem(mxResources.get('trello') + ' (' + mxResources.get('loading') + '...)', null, function()
				{
					// do nothing
				}, parent, null, false);
			}
			
			menu.addSeparator(parent);

			if (isLocalStorage && urlParams['browser'] != '0')
			{
				menu.addItem(mxResources.get('browser') + '...', null, function()
				{
					editorUi.importLocalFile(false);
				}, parent);
			}

			if (urlParams['noDevice'] != '1')
			{
				menu.addItem(mxResources.get('device') + '...', null, function()
				{
					editorUi.importLocalFile(true);
				}, parent);
			}
			
			if (!editorUi.isOffline())
			{
				menu.addSeparator(parent);
				
				menu.addItem(mxResources.get('url') + '...', null, function()
				{
					var dlg = new FilenameDialog(editorUi, '', mxResources.get('import'), function(fileUrl)
					{
						if (fileUrl != null && fileUrl.length > 0 && editorUi.spinner.spin(document.body, mxResources.get('loading')))
						{
							var mime = (/(\.png)($|\?)/i.test(fileUrl)) ? 'image/png' : 'text/xml';
							
							// Uses proxy to avoid CORS issues
							editorUi.editor.loadUrl(PROXY_URL + '?url=' + encodeURIComponent(fileUrl), function(data)
							{
								doImportFile(data, mime, fileUrl);
							},
							function ()
							{
								editorUi.spinner.stop();
								editorUi.handleError(null, mxResources.get('errorLoadingFile'));
							}, mime == 'image/png');
						}
					}, mxResources.get('url'));
					editorUi.showDialog(dlg.container, 300, 80, true, true);
					dlg.init();
				}, parent);
			}
		}))).isEnabled = isGraphEnabled;

		this.put('theme', new Menu(mxUtils.bind(this, function(menu, parent)
		{
			var theme = (urlParams['sketch'] == '1') ? 'sketch' : mxSettings.getUi();

			var item = menu.addItem(mxResources.get('automatic'), null, function()
			{
				mxSettings.setUi('');
				editorUi.alert(mxResources.get('restartForChangeRequired'));
			}, parent);
			
			if (theme != 'kennedy' && theme != 'atlas' &&
				theme != 'dark' && theme != 'min' &&
				theme != 'sketch')
			{
				menu.addCheckmark(item, Editor.checkmarkImage);
			}

			menu.addSeparator(parent);
			
			item = menu.addItem(mxResources.get('default'), null, function()
			{
				mxSettings.setUi('kennedy');
				editorUi.alert(mxResources.get('restartForChangeRequired'));
			}, parent);

			if (theme == 'kennedy')
			{
				menu.addCheckmark(item, Editor.checkmarkImage);
			}

			item = menu.addItem(mxResources.get('minimal'), null, function()
			{
				mxSettings.setUi('min');
				editorUi.alert(mxResources.get('restartForChangeRequired'));
			}, parent);
			
			if (theme == 'min')
			{
				menu.addCheckmark(item, Editor.checkmarkImage);
			}
			
			item = menu.addItem(mxResources.get('atlas'), null, function()
			{
				mxSettings.setUi('atlas');
				editorUi.alert(mxResources.get('restartForChangeRequired'));
			}, parent);
			
			if (theme == 'atlas')
			{
				menu.addCheckmark(item, Editor.checkmarkImage);
			}
			
			if (theme == 'dark' || (!mxClient.IS_IE && !mxClient.IS_IE11))
			{
				item = menu.addItem(mxResources.get('dark'), null, function()
				{
					mxSettings.setUi('dark');
					editorUi.alert(mxResources.get('restartForChangeRequired'));
				}, parent);
				
				if (theme == 'dark')
				{
					menu.addCheckmark(item, Editor.checkmarkImage);
				}
			}
			
			menu.addSeparator(parent);
			
			item = menu.addItem(mxResources.get('sketch'), null, function()
			{
				mxSettings.setUi('sketch');
				editorUi.alert(mxResources.get('restartForChangeRequired'));
			}, parent);
			
			if (theme == 'sketch')
			{
				menu.addCheckmark(item, Editor.checkmarkImage);
			}
		})));

		var renameAction = this.editorUi.actions.addAction('rename...', mxUtils.bind(this, function()
		{
			var file = this.editorUi.getCurrentFile();
			
			if (file != null)
			{
				if (file.constructor == LocalFile && file.fileHandle != null)
				{
					editorUi.showSaveFilePicker(mxUtils.bind(editorUi, function(fileHandle, desc)
					{
						file.invalidFileHandle = null;
						file.fileHandle = fileHandle;
						file.title = desc.name;
						file.desc = desc;
						editorUi.save(desc.name);
					}), null, editorUi.createFileSystemOptions(file.getTitle()));
				}
				else
				{
					var filename = (file.getTitle() != null) ? file.getTitle() : this.editorUi.defaultFilename;
					
					var dlg = new FilenameDialog(this.editorUi, filename, mxResources.get('rename'), mxUtils.bind(this, function(title)
					{
						if (title != null && title.length > 0 && file != null && title != file.getTitle() &&
							this.editorUi.spinner.spin(document.body, mxResources.get('renaming')))
						{
							// Delete old file, save new file in dropbox if autosize is enabled
							file.rename(title, mxUtils.bind(this, function(resp)
							{
								this.editorUi.spinner.stop();
							}),
							mxUtils.bind(this, function(resp)
							{
								this.editorUi.handleError(resp, (resp != null) ? mxResources.get('errorRenamingFile') : null);
							}));
						}
					}), (file.constructor == DriveFile || file.constructor == StorageFile) ?
						mxResources.get('diagramName') : null, function(name)
					{
						if (name != null && name.length > 0)
						{
							return true;
						}
						
						editorUi.showError(mxResources.get('error'), mxResources.get('invalidName'), mxResources.get('ok'));
						
						return false;
					}, null, null, null, null, editorUi.editor.fileExtensions);
					this.editorUi.showDialog(dlg.container, 340, 96, true, true);
					dlg.init();
				}
			}
		}));
		
		renameAction.isEnabled = function()
		{
			return this.enabled && isGraphEnabled.apply(this, arguments);
		}
		
		renameAction.visible = urlParams['embed'] != '1';
		
		editorUi.actions.addAction('makeCopy...', mxUtils.bind(this, function()
		{
			var file = editorUi.getCurrentFile();
			
			if (file != null)
			{
				var title = editorUi.getCopyFilename(file);

				if (file.constructor == DriveFile)
				{
					var dlg = new CreateDialog(editorUi, title, mxUtils.bind(this, function(newTitle, mode)
					{
						if (mode == '_blank')
						{
							editorUi.editor.editAsNew(editorUi.getFileData(), newTitle);
						}
						else
						{
							// Mode is "download" if Create button is pressed, means use Google Drive
							if (mode == 'download')
							{
								mode = App.MODE_GOOGLE;
							}
	
							if (newTitle != null && newTitle.length > 0)
							{
								if (mode == App.MODE_GOOGLE)
								{
									if (editorUi.spinner.spin(document.body, mxResources.get('saving')))
									{
										// Saveas does not update the file descriptor in Google Drive
										file.saveAs(newTitle, mxUtils.bind(this, function(resp)
										{
											// Replaces file descriptor in-place and saves
											file.desc = resp;
											
											// Makes sure the latest XML is in the file
											file.save(false, mxUtils.bind(this, function()
											{
												editorUi.spinner.stop();
												file.setModified(false);
												file.addAllSavedStatus();
											}), mxUtils.bind(this, function(resp)
											{
												editorUi.handleError(resp);
											}));
										}), mxUtils.bind(this, function(resp)
										{
											editorUi.handleError(resp);
										}));
									}
								}
								else
								{
									editorUi.createFile(newTitle, editorUi.getFileData(true), null, mode);
								}
							}
						}
					}), mxUtils.bind(this, function()
					{
						editorUi.hideDialog();
					}), mxResources.get('makeCopy'), mxResources.get('create'), null,
						null, true, null, true, null, null, null, null,
						editorUi.editor.fileExtensions);
					editorUi.showDialog(dlg.container, 420, 380, true, true);
					dlg.init();
				}
				else
				{
					// Creates a copy with no predefined storage
					editorUi.editor.editAsNew(this.editorUi.getFileData(true), title);
				}
			}
		}));
		
		editorUi.actions.addAction('moveToFolder...', mxUtils.bind(this, function()
		{
			var file = editorUi.getCurrentFile();
			
			if (file.getMode() == App.MODE_GOOGLE || file.getMode() == App.MODE_ONEDRIVE)
			{
				var isInRoot = false;
				
				if (file.getMode() == App.MODE_GOOGLE && file.desc.parents != null)
				{
					for (var i = 0; i < file.desc.parents.length; i++)
					{
						if (file.desc.parents[i].isRoot)
						{
							isInRoot = true;
							break;
						}
					}
				}
				
				editorUi.pickFolder(file.getMode(), mxUtils.bind(this, function(folderId)
				{
	            	if (editorUi.spinner.spin(document.body, mxResources.get('moving')))
	            	{
	            	    file.move(folderId, mxUtils.bind(this, function(resp)
	            		{
	            	    	editorUi.spinner.stop();
	        			}), mxUtils.bind(this, function(resp)
	        			{
	        				editorUi.handleError(resp);
	        			}));
	            	}
				}), null, true, isInRoot);
			}
		}));
		
		this.put('publish', new Menu(mxUtils.bind(this, function(menu, parent)
		{
			this.addMenuItems(menu, ['publishLink'], parent);
		})));

		editorUi.actions.put('useOffline', new Action(mxResources.get('useOffline') + '...', function()
		{
			editorUi.openLink('https://app.draw.io/')
		}));
		
		editorUi.actions.put('downloadDesktop', new Action(mxResources.get('downloadDesktop') + '...', function()
		{
			editorUi.openLink('https://get.draw.io/')
		}));

		// this.editorUi.actions.addAction('reloadDefaultAnswer', mxUtils.bind(this, function()
		// {
		// 	editorUi.js2exe_ReloadPresetAnswer();
		// 	return;
		// 	/*******
		// 	// yanwx, 测试
		// 	var data = `
		// 	<?xml version="1.0" encoding="UTF-8"?>
		// 		<mxfile host="10.33.1.93" modified="2021-11-17T03:37:24.311Z" agent="5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36" etag="62bmfzdsVxE7lANwyOxU" version="@DRAWIO-VERSION@"><diagram id="c7ikU0njrpY1M8Yy4mg5" name="第 1 页">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</diagram></mxfile>
		// 	`
		// 	// 设置data
		// 	data = Graph.zapGremlins(mxUtils.trim(data))
		// 	this.editorUi.editor.setGraphXml(mxUtils.parseXml(data).documentElement)
		// 	this.editorUi.editor.graph.selectAll();
		// 	*********/
		// }));

		// this.editorUi.actions.addAction('saveData', mxUtils.bind(this, function()
		// {
		// 	// 仅保存不退出
		// 	window.editorUi.js2exe_SaveToAnswerArea(false, 1);		// yanwx, 1：手动保存
		// 	return ;
		// 	/*******
		// 	// (format, uncompressed, addShadow, ignoreSelection, currentPage, pageVisible, transparent, scale, border, grid, includeXml, pageRange)
		// 	this.editorUi.downloadFile('xmlpng', false, null, true, false);
		// 	// 获取压缩过的XML data字符串
		// 	var xmlData = Graph.xmlDeclaration +'\n' + this.editorUi.getFileData(true, null, null, null, true, false,
		// 	null, null, null, false)
		// 	console.log(xmlData)
		// 	// 获取没压缩过的XML data字符串
		// 	var unCompressXmlData = Graph.xmlDeclaration +'\n' + this.editorUi.getFileData(true, null, null, null, true, false,
		// 	null, null, null, true)
		// 	console.log(unCompressXmlData)
		// 	// 获取完整结构字符串
		// 	// console.log(mxUtils.getPrettyXml(editorUi.editor.getGraphXml()))
		// 	 * ******/
		// }));

		this.editorUi.actions.addAction('formula', mxUtils.bind(this, function()
		{
			window.editorUi.openKformula();
			return;
			var editorUi = this.editorUi;
			editorUi.editor.graph.clearSelection();
			// new mxCell("Last updated 3 mins ago", new mxGeometry(0, 1, 260, 50), "html=1;shadow=0;dashed=0;shape=mxgraph.basic.corner_round_rect;dx=2;flipV=1;perimeter=none;whiteSpace=wrap;fillColor=#F7F7F7;strokeColor=#DFDFDF;fontColor=#6C767D;resizeWidth=1;fontSize=13;align=left;spacing=20;")
			$('.kf-model').css('visibility', 'visible')
			window.kfe.execCommand( "render", "\\placeholder" );
			window.kfe.execCommand( "focus" );
		}));


		this.put('embed', new Menu(mxUtils.bind(this, function(menu, parent)
		{
			var file = editorUi.getCurrentFile();			
			if (file != null && (file.getMode() == App.MODE_GOOGLE ||
				file.getMode() == App.MODE_GITHUB) && /(\.png)$/i.test(file.getTitle()))
			{
				this.addMenuItems(menu, ['liveImage', '-'], parent);
			}
			
			this.addMenuItems(menu, ['embedImage', 'embedSvg', '-', 'embedHtml'], parent);			
			if (!navigator.standalone && !editorUi.isOffline())
			{
				this.addMenuItems(menu, ['embedIframe'], parent);
			}

			if (urlParams['embed'] != '1' && !editorUi.isOffline())
			{
				// yanwx
				// this.addMenuItems(menu, ['-', 'googleDocs', 'googleSlides', 'googleSheets', '-', 'microsoftOffice', '-', 'embedNotion'], parent);
				this.addMenuItems(menu, ['-',  'embedNotion'], parent);
			}
		})));

		editorUi.addInsertItem = function(menu, parent, title, method)
		{
			if (method != 'plantUml' || (EditorUi.enablePlantUml && !editorUi.isOffline()))
			{
				menu.addItem(title, null, mxUtils.bind(this, function()
				{
					if (method == 'fromText' || method == 'formatSql' ||
						method == 'plantUml' || method == 'mermaid')
					{
						var dlg = new ParseDialog(editorUi, title, method);
						editorUi.showDialog(dlg.container, 620, 420, true, false);
						editorUi.dialog.container.style.overflow = 'auto';
						dlg.init();
					}
					else
					{
						var dlg = new CreateGraphDialog(editorUi, title, method);
						editorUi.showDialog(dlg.container, 620, 420, true, false);
						// Executed after dialog is added to dom
						dlg.init();
					}
				}), parent, null, isGraphEnabled());
			}
		};
		
		var insertVertex = function(value, w, h, style)
		{
			var cell = new mxCell(value, new mxGeometry(0, 0, w, h), style);
			cell.vertex = true;

			var pt = graph.getCenterInsertPoint(graph.getBoundingBoxFromGeometry([cell], true));
			cell.geometry.x = pt.x;
    	    cell.geometry.y = pt.y;
		
    		graph.getModel().beginUpdate();
    		try
    	    {
    			cell = graph.addCell(cell);
    	    	graph.fireEvent(new mxEventObject('cellsInserted', 'cells', [cell]));
    	    }
    		finally
    		{
    			graph.getModel().endUpdate();
    		}
		
    		graph.scrollCellToVisible(cell);
    		graph.setSelectionCell(cell);
    		graph.container.focus();

    		if (graph.editAfterInsert)
    		{
    	        graph.startEditing(cell);
    		}
    		
    		// Async call is workaroun for touch events resetting hover icons
    		window.setTimeout(function()
    		{
	    		if (editorUi.hoverIcons != null)
				{
					editorUi.hoverIcons.update(graph.view.getState(cell));
				}
    		}, 0);
    		
	    	return cell;
		};
		
		editorUi.actions.put('insertFormula', new Action(mxResources.get('formula'), function()
		{	// 插入公式
			editorUi.editor.graph.clearSelection();
			// new mxCell("Last updated 3 mins ago", new mxGeometry(0, 1, 260, 50), "html=1;shadow=0;dashed=0;shape=mxgraph.basic.corner_round_rect;dx=2;flipV=1;perimeter=none;whiteSpace=wrap;fillColor=#F7F7F7;strokeColor=#DFDFDF;fontColor=#6C767D;resizeWidth=1;fontSize=13;align=left;spacing=20;")
			$('.kf-model').css('visibility', 'visible');
			window.kfe.execCommand( "render", "\\placeholder" );
			window.kfe.execCommand( "focus" );			
		}), null, null, Editor.ctrlKey + '+Shift+F').isEnabled = isGraphEnabled;

		editorUi.actions.put('insertText', new Action(mxResources.get('text'), function()
		{
			if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent()))
			{
    			graph.startEditingAtCell(insertVertex('Text', 40, 20, 'text;html=1;resizable=0;autosize=1;' +
    				'align=center;verticalAlign=middle;points=[];fillColor=none;strokeColor=none;rounded=0;'));
			}
		}), null, null, Editor.ctrlKey + '+Shift+X').isEnabled = isGraphEnabled;
		
		editorUi.actions.put('insertRectangle', new Action(mxResources.get('rectangle'), function()
		{
			if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent()))
			{
    	    	insertVertex('', 120, 60, 'whiteSpace=wrap;html=1;');
			}
		}), null, null, Editor.ctrlKey + '+K').isEnabled = isGraphEnabled;

		editorUi.actions.put('insertEllipse', new Action(mxResources.get('ellipse'), function()
		{
			if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent()))
			{
    	    	insertVertex('', 80, 80, 'ellipse;whiteSpace=wrap;html=1;');
			}
		}), null, null, Editor.ctrlKey + '+Shift+K').isEnabled = isGraphEnabled;
		
		editorUi.actions.put('insertRhombus', new Action(mxResources.get('rhombus'), function()
		{
			if (graph.isEnabled() && !graph.isCellLocked(graph.getDefaultParent()))
			{
    	    	insertVertex('', 80, 80, 'rhombus;whiteSpace=wrap;html=1;');
			}
		})).isEnabled = isGraphEnabled;
		
		editorUi.addInsertMenuItems = mxUtils.bind(this, function(menu, parent, methods)
		{
			for (var i = 0; i < methods.length; i++)
			{
				if (methods[i] == '-')
				{
					menu.addSeparator(parent);
				}
				else
				{
					editorUi.addInsertItem(menu, parent, mxResources.get(methods[i]) + '...', methods[i]);
				}
			}
		});
		
		this.put('insert', new Menu(mxUtils.bind(this, function(menu, parent)
		{
			// 插入公式
			this.addMenuItems(menu, ['insertFormula', '-', 'insertRectangle', 'insertEllipse',
				'insertRhombus', '-', 'insertText', 'insertLink', '-',
				'createShape', 'insertFreehand', '-', 'insertImage'], parent);

			if (editorUi.insertTemplateEnabled && !editorUi.isOffline())
			{
				this.addMenuItems(menu, ['insertTemplate'], parent);
			}
			
			menu.addSeparator(parent);
			if (urlParams['customMenu'] != '1') { // yanwx, 1定制菜单
				this.addSubmenu('insertLayout', menu, parent, mxResources.get('layout'));
				this.addSubmenu('insertAdvanced', menu, parent, mxResources.get('advanced'));
			}
		})));

		if (urlParams['customMenu'] != '1') { // yanwx, 1定制菜单
			this.put('insertLayout', new Menu(mxUtils.bind(this, function(menu, parent)
			{
				editorUi.addInsertMenuItems(menu, parent, ['horizontalFlow', 'verticalFlow', '-', 'horizontalTree',
					'verticalTree', 'radialTree', '-', 'organic', 'circle']);
			})));
	
			this.put('insertAdvanced', new Menu(mxUtils.bind(this, function(menu, parent)
			{
				editorUi.addInsertMenuItems(menu, parent, ['fromText', 'plantUml', 'mermaid', '-', 'formatSql']);
				
				menu.addItem(mxResources.get('csv') + '...', null, function()
				{
					editorUi.showImportCsvDialog();
				}, parent, null, isGraphEnabled());
			})));
		}
        
		this.put('openRecent', new Menu(function(menu, parent)
		{
			var recent = editorUi.getRecent();

			if (recent != null)
			{
				for (var i = 0; i < recent.length; i++)
				{
					(function(entry)
					{
						var modeKey = entry.mode;
						
						// Google and oneDrive use different keys
						if (modeKey == App.MODE_GOOGLE)
						{
							modeKey = 'googleDrive';
						}
						else if (modeKey == App.MODE_ONEDRIVE)
						{
							modeKey = 'oneDrive';
						}
						
						menu.addItem(entry.title + ' (' + mxResources.get(modeKey) + ')', null, function()
						{
							editorUi.loadFile(entry.id);
						}, parent);
					})(recent[i]);
				}

				menu.addSeparator(parent);
			}

			menu.addItem(mxResources.get('reset'), null, function()
			{
				editorUi.resetRecent();
			}, parent);
		}));
		
		this.put('openFrom', new Menu(function(menu, parent)
		{
			if (editorUi.drive != null)
			{
				menu.addItem(mxResources.get('googleDrive') + '...', null, function()
				{
					editorUi.pickFile(App.MODE_GOOGLE);
				}, parent);
			}
			else if (googleEnabled && typeof window.DriveClient === 'function')
			{
				menu.addItem(mxResources.get('googleDrive') + ' (' + mxResources.get('loading') + '...)', null, function()
				{
					// do nothing
				}, parent, null, false);
			}
			
			if (editorUi.oneDrive != null)
			{
				menu.addItem(mxResources.get('oneDrive') + '...', null, function()
				{
					editorUi.pickFile(App.MODE_ONEDRIVE);
				}, parent);
			}
			else if (oneDriveEnabled && typeof window.OneDriveClient === 'function')
			{
				menu.addItem(mxResources.get('oneDrive') + ' (' + mxResources.get('loading') + '...)', null, function()
				{
					// do nothing
				}, parent, null, false);
			}
			
			if (editorUi.dropbox != null)
			{
				menu.addItem(mxResources.get('dropbox') + '...', null, function()
				{
					editorUi.pickFile(App.MODE_DROPBOX);
				}, parent);
			}
			else if (dropboxEnabled && typeof window.DropboxClient === 'function')
			{
				menu.addItem(mxResources.get('dropbox') + ' (' + mxResources.get('loading') + '...)', null, function()
				{
					// do nothing
				}, parent, null, false);
			}

			menu.addSeparator(parent);
			
			if (editorUi.gitHub != null)
			{
				menu.addItem(mxResources.get('github') + '...', null, function()
				{
					editorUi.pickFile(App.MODE_GITHUB);
				}, parent);
			}
			
			if (editorUi.gitLab != null)
			{
				menu.addItem(mxResources.get('gitlab') + '...', null, function()
				{
					editorUi.pickFile(App.MODE_GITLAB);
				}, parent);
			}

			if (editorUi.notion != null)
			{
				menu.addSeparator(parent);
				menu.addItem(mxResources.get('notion') + '...', null, function()
				{
					editorUi.pickFile(App.MODE_NOTION);
				}, parent);
			}

			if (editorUi.trello != null)
			{
				menu.addItem(mxResources.get('trello') + '...', null, function()
				{
					editorUi.pickFile(App.MODE_TRELLO);
				}, parent);
			}
			else if (trelloEnabled && typeof window.TrelloClient === 'function')
			{
				menu.addItem(mxResources.get('trello') + ' (' + mxResources.get('loading') + '...)', null, function()
				{
					// do nothing
				}, parent, null, false);
			}
			
			menu.addSeparator(parent);

			if (isLocalStorage && urlParams['browser'] != '0')
			{
				menu.addItem(mxResources.get('browser') + '...', null, function()
				{
					editorUi.pickFile(App.MODE_BROWSER);
				}, parent);
			}
			
			//if (!mxClient.IS_IOS)
			if (urlParams['noDevice'] != '1')
			{
				menu.addItem(mxResources.get('device') + '...', null, function()
				{
					editorUi.pickFile(App.MODE_DEVICE);
				}, parent);
			}

			if (!editorUi.isOffline())
			{
				menu.addSeparator(parent);
				
				menu.addItem(mxResources.get('url') + '...', null, function()
				{
					var dlg = new FilenameDialog(editorUi, '', mxResources.get('open'), function(fileUrl)
					{
						if (fileUrl != null && fileUrl.length > 0)
						{
							if (editorUi.getCurrentFile() == null)
							{
								window.location.hash = '#U' + encodeURIComponent(fileUrl);
							}
							else
							{
								window.openWindow(((mxClient.IS_CHROMEAPP) ?
									'https://www.draw.io/' : 'https://' + location.host + '/') +
									window.location.search + '#U' + encodeURIComponent(fileUrl));
							}
						}
					}, mxResources.get('url'));
					editorUi.showDialog(dlg.container, 300, 80, true, true);
					dlg.init();
				}, parent);
			}
		}));
		
		if (Editor.enableCustomLibraries)
		{
			this.put('newLibrary', new Menu(function(menu, parent)
			{
				if (typeof(google) != 'undefined' && typeof(google.picker) != 'undefined')
				{
					if (editorUi.drive != null)
					{
						menu.addItem(mxResources.get('googleDrive') + '...', null, function()
						{
							editorUi.showLibraryDialog(null, null, null, null, App.MODE_GOOGLE);
						}, parent);
					}
					else if (googleEnabled && typeof window.DriveClient === 'function')
					{
						menu.addItem(mxResources.get('googleDrive') + ' (' + mxResources.get('loading') + '...)', null, function()
						{
							// do nothing
						}, parent, null, false);
					}
				}

				if (editorUi.oneDrive != null)
				{
					menu.addItem(mxResources.get('oneDrive') + '...', null, function()
					{
						editorUi.showLibraryDialog(null, null, null, null, App.MODE_ONEDRIVE);
					}, parent);
				}
				else if (oneDriveEnabled && typeof window.OneDriveClient === 'function')
				{
					menu.addItem(mxResources.get('oneDrive') + ' (' + mxResources.get('loading') + '...)', null, function()
					{
						// do nothing
					}, parent, null, false);
				}

				if (editorUi.dropbox != null)
				{
					menu.addItem(mxResources.get('dropbox') + '...', null, function()
					{
						editorUi.showLibraryDialog(null, null, null, null, App.MODE_DROPBOX);
					}, parent);
				}
				else if (dropboxEnabled && typeof window.DropboxClient === 'function')
				{
					menu.addItem(mxResources.get('dropbox') + ' (' + mxResources.get('loading') + '...)', null, function()
					{
						// do nothing
					}, parent, null, false);
				}
				
				menu.addSeparator(parent);
				
				if (editorUi.gitHub != null)
				{
					menu.addItem(mxResources.get('github') + '...', null, function()
					{
						editorUi.showLibraryDialog(null, null, null, null, App.MODE_GITHUB);
					}, parent);
				}
				
				if (editorUi.gitLab != null)
				{
					menu.addItem(mxResources.get('gitlab') + '...', null, function()
					{
						editorUi.showLibraryDialog(null, null, null, null, App.MODE_GITLAB);
					}, parent);
				}
				
				if (editorUi.notion != null)
				{
					menu.addSeparator(parent);
					menu.addItem(mxResources.get('notion') + '...', null, function()
					{
						editorUi.showLibraryDialog(null, null, null, null, App.MODE_NOTION);
					}, parent);
				}

				if (editorUi.trello != null)
				{
					menu.addItem(mxResources.get('trello') + '...', null, function()
					{
						editorUi.showLibraryDialog(null, null, null, null, App.MODE_TRELLO);
					}, parent);
				}
				else if (trelloEnabled && typeof window.TrelloClient === 'function')
				{
					menu.addItem(mxResources.get('trello') + ' (' + mxResources.get('loading') + '...)', null, function()
					{
						// do nothing
					}, parent, null, false);
				}
				
				menu.addSeparator(parent);
	
				if (isLocalStorage && urlParams['browser'] != '0')
				{
					menu.addItem(mxResources.get('browser') + '...', null, function()
					{
						editorUi.showLibraryDialog(null, null, null, null, App.MODE_BROWSER);
					}, parent);
				}
				
				//if (!mxClient.IS_IOS)
				if (urlParams['noDevice'] != '1')
				{
					menu.addItem(mxResources.get('device') + '...', null, function()
					{
						editorUi.showLibraryDialog(null, null, null, null, App.MODE_DEVICE);
					}, parent);
				}
			}));
	
			this.put('openLibraryFrom', new Menu(function(menu, parent)
			{
				if (typeof(google) != 'undefined' && typeof(google.picker) != 'undefined')
				{
					if (editorUi.drive != null)
					{
						menu.addItem(mxResources.get('googleDrive') + '...', null, function()
						{
							editorUi.pickLibrary(App.MODE_GOOGLE);
						}, parent);
					}
					else if (googleEnabled && typeof window.DriveClient === 'function')
					{
						menu.addItem(mxResources.get('googleDrive') + ' (' + mxResources.get('loading') + '...)', null, function()
						{
							// do nothing
						}, parent, null, false);
					}
				}

				if (editorUi.oneDrive != null)
				{
					menu.addItem(mxResources.get('oneDrive') + '...', null, function()
					{
						editorUi.pickLibrary(App.MODE_ONEDRIVE);
					}, parent);
				}
				else if (oneDriveEnabled && typeof window.OneDriveClient === 'function')
				{
					menu.addItem(mxResources.get('oneDrive') + ' (' + mxResources.get('loading') + '...)', null, function()
					{
						// do nothing
					}, parent, null, false);
				}

				if (editorUi.dropbox != null)
				{
					menu.addItem(mxResources.get('dropbox') + '...', null, function()
					{
						editorUi.pickLibrary(App.MODE_DROPBOX);
					}, parent);
				}
				else if (dropboxEnabled && typeof window.DropboxClient === 'function')
				{
					menu.addItem(mxResources.get('dropbox') + ' (' + mxResources.get('loading') + '...)', null, function()
					{
						// do nothing
					}, parent, null, false);
				}
				
				menu.addSeparator(parent);
				
				if (editorUi.gitHub != null)
				{
					menu.addItem(mxResources.get('github') + '...', null, function()
					{
						editorUi.pickLibrary(App.MODE_GITHUB);
					}, parent);
				}
				
				if (editorUi.gitLab != null)
				{
					menu.addItem(mxResources.get('gitlab') + '...', null, function()
					{
						editorUi.pickLibrary(App.MODE_GITLAB);
					}, parent);
				}
				
				if (editorUi.notion != null)
				{
					menu.addSeparator(parent);
					menu.addItem(mxResources.get('notion') + '...', null, function()
					{
						editorUi.pickLibrary(App.MODE_NOTION);
					}, parent);
				}

				if (editorUi.trello != null)
				{
					menu.addItem(mxResources.get('trello') + '...', null, function()
					{
						editorUi.pickLibrary(App.MODE_TRELLO);
					}, parent);
				}
				else if (trelloEnabled && typeof window.TrelloClient === 'function')
				{
					menu.addItem(mxResources.get('trello') + ' (' + mxResources.get('loading') + '...)', null, function()
					{
						// do nothing
					}, parent, null, false);
				}
				
				menu.addSeparator(parent);
	
				if (isLocalStorage && urlParams['browser'] != '0')
				{
					menu.addItem(mxResources.get('browser') + '...', null, function()
					{
						editorUi.pickLibrary(App.MODE_BROWSER);
					}, parent);
				}
				
				//if (!mxClient.IS_IOS)
				if (urlParams['noDevice'] != '1')
				{
					menu.addItem(mxResources.get('device') + '...', null, function()
					{
						editorUi.pickLibrary(App.MODE_DEVICE);
					}, parent);
				}
	
				if (!editorUi.isOffline())
				{
					menu.addSeparator(parent);
					
					menu.addItem(mxResources.get('url') + '...', null, function()
					{
						var dlg = new FilenameDialog(editorUi, '', mxResources.get('open'), function(fileUrl)
						{
							if (fileUrl != null && fileUrl.length > 0 && editorUi.spinner.spin(document.body, mxResources.get('loading')))
							{
								var realUrl = fileUrl;
								
								if (!editorUi.editor.isCorsEnabledForUrl(fileUrl))
								{
									realUrl = PROXY_URL + '?url=' + encodeURIComponent(fileUrl);
								}
								
								// Uses proxy to avoid CORS issues
								mxUtils.get(realUrl, function(req)
								{
									if (req.getStatus() >= 200 && req.getStatus() <= 299)
									{
										editorUi.spinner.stop();
										
										try
										{
											editorUi.loadLibrary(new UrlLibrary(this, req.getText(), fileUrl));
										}
										catch (e)
										{
											editorUi.handleError(e, mxResources.get('errorLoadingFile'));
										}
									}
									else
									{
										editorUi.spinner.stop();
										editorUi.handleError(null, mxResources.get('errorLoadingFile'));
									}
								}, function()
								{
									editorUi.spinner.stop();
									editorUi.handleError(null, mxResources.get('errorLoadingFile'));
								});
							}
						}, mxResources.get('url'));
						editorUi.showDialog(dlg.container, 300, 80, true, true);
						dlg.init();
					}, parent);
				}
				
				if (urlParams['confLib'] == '1')
				{
					menu.addSeparator(parent);
					
					menu.addItem(mxResources.get('confluenceCloud') + '...', null, function()
					{
						editorUi.showRemotelyStoredLibrary(mxResources.get('libraries'));
					}, parent);
				}
			}));
		}

		// Overrides edit menu to add find, copyAsImage editGeometry
		this.put('edit', new Menu(mxUtils.bind(this, function(menu, parent)
		{
			if (urlParams['customMenu'] == '1') {  // 定制菜单
				this.addMenuItems(menu, ['undo', 'redo', '-', 'cut', 'copy', 'paste',
					'delete', '-', 'duplicate', '-', 'findReplace', '-', 'editData', 'editTooltip', '-',
					'editStyle',  'editGeometry', '-', 'edit', '-', 
					'selectVertices', 'selectEdges', 'selectAll', 'selectNone', '-', 'lockUnlock']);
			}
			else {
				this.addMenuItems(menu, ['undo', 'redo', '-', 'cut', 'copy', 'copyAsImage', 'paste',
					'delete', '-', 'duplicate', '-', 'findReplace', '-', 'editData', 'editTooltip', '-',
					'editStyle',  'editGeometry', '-', 'edit', '-', 'editLink', 'openLink', '-',
					'selectVertices', 'selectEdges', 'selectAll', 'selectNone', '-', 'lockUnlock']);
			}
		})));

		var action = editorUi.actions.addAction('comments', mxUtils.bind(this, function()
		{
			if (this.commentsWindow == null)
			{
				// LATER: Check outline window for initial placement
				this.commentsWindow = new CommentsWindow(editorUi, document.body.offsetWidth - 380, 120, 300, 350);
				//TODO Are these events needed?
				this.commentsWindow.window.addListener('show', function()
				{
					editorUi.fireEvent(new mxEventObject('comments'));
				});
				this.commentsWindow.window.addListener('hide', function()
				{
					editorUi.fireEvent(new mxEventObject('comments'));
				});
				this.commentsWindow.window.setVisible(true);
				editorUi.fireEvent(new mxEventObject('comments'));
			}
			else
			{
				var isVisible = !this.commentsWindow.window.isVisible();
				this.commentsWindow.window.setVisible(isVisible);
				
				this.commentsWindow.refreshCommentsTime();

				if (isVisible && this.commentsWindow.hasError) 
				{
					this.commentsWindow.refreshComments();
				}				
			}
		}));
		action.setToggleAction(true);
		action.setSelectedCallback(mxUtils.bind(this, function() { return this.commentsWindow != null && this.commentsWindow.window.isVisible(); }));

		// Destroys comments window to force update or disable if not supported
		editorUi.editor.addListener('fileLoaded', mxUtils.bind(this, function()
		{
			if (this.commentsWindow != null)
			{
				this.commentsWindow.destroy();
				this.commentsWindow = null;
			}
		}));
		
		// Extends toolbar dropdown to add comments
		var viewPanelsMenu = this.get('viewPanels');
		var viewPanelsFunct = viewPanelsMenu.funct;
		
		viewPanelsMenu.funct = function(menu, parent)
		{
			viewPanelsFunct.apply(this, arguments);

			editorUi.menus.addMenuItems(menu, ['tags'], parent);
			
			if (editorUi.commentsSupported())
			{
				editorUi.menus.addMenuItems(menu, ['comments'], parent);
			}
		};

		// Overrides view menu to add search and scratchpad
		this.put('view', new Menu(mxUtils.bind(this, function(menu, parent)
		{
			this.addMenuItems(menu, ((this.editorUi.format != null) ? ['formatPanel'] : []).
				concat(['outline', 'layers', 'tags']).concat((editorUi.commentsSupported()) ?
				['comments', '-'] : ['-']));
			
			this.addMenuItems(menu, ['-', 'search'], parent);
			
			if (isLocalStorage || mxClient.IS_CHROMEAPP)
			{
				var item = this.addMenuItem(menu, 'scratchpad', parent);
				
				if (!editorUi.isOffline() || mxClient.IS_CHROMEAPP || EditorUi.isElectronApp)
				{
					this.addLinkToItem(item, 'https://www.diagrams.net/doc/faq/scratchpad');
				}
			}
			
			this.addMenuItems(menu, ['shapes', '-', 'pageView', 'pageScale']);
			this.addSubmenu('units', menu, parent);				
			this.addMenuItems(menu, ['-', 'scrollbars', 'tooltips', 'ruler', '-',
                'grid', 'guides'], parent);
			
			if (mxClient.IS_SVG && (document.documentMode == null || document.documentMode > 9))
			{
				this.addMenuItem(menu, 'shadowVisible', parent);
			}
			
			this.addMenuItems(menu, ['-', 'connectionArrows', 'connectionPoints', '-',
			                         'resetView', 'zoomIn', 'zoomOut'], parent);

			if (urlParams['sketch'] != '1')
			{
				 this.addMenuItems(menu, ['-', 'fullscreen'], parent);
			}
		})));
		
		this.put('extras', new Menu(mxUtils.bind(this, function(menu, parent)
		{
			if (urlParams['customMenu'] == '1') { // yanwx, 1定制菜单
				this.addMenuItems(menu, ['-', 'editDiagram'], parent);
			}
			else {
				if (urlParams['noLangIcon'] == '1')
				{
					this.addSubmenu('language', menu, parent);
					menu.addSeparator(parent);
				}
				
				if (urlParams['embed'] != '1')
				{
					this.addSubmenu('theme', menu, parent);
					menu.addSeparator(parent);
				}

				if (typeof(MathJax) !== 'undefined')
				{
					var item = this.addMenuItem(menu, 'mathematicalTypesetting', parent);
					
					if (!editorUi.isOffline() || mxClient.IS_CHROMEAPP || EditorUi.isElectronApp)
					{
						this.addLinkToItem(item, 'https://www.diagrams.net/doc/faq/math-typesetting');
					}
				}
				
				this.addMenuItems(menu, ['copyConnect', 'collapseExpand', '-'], parent);
				
				if (urlParams['embed'] != '1' && (isLocalStorage || mxClient.IS_CHROMEAPP))
				{
					this.addMenuItems(menu, ['showStartScreen'], parent);
				}

				if (urlParams['embed'] != '1')
				{
					this.addMenuItems(menu, ['autosave'], parent);
				}
				
				menu.addSeparator(parent);
				
				if (!editorUi.isOfflineApp() && isLocalStorage)
				{
					this.addMenuItem(menu, 'plugins', parent);
				}

				this.addMenuItems(menu, ['-', 'editDiagram'], parent);
		
				if (Graph.translateDiagram)
				{
					this.addMenuItems(menu, ['diagramLanguage']);
				}
				
				this.addMenuItems(menu, ['-', 'configuration'], parent);
				
				// Adds trailing separator in case new plugin entries are added
				menu.addSeparator(parent);
				
				if (urlParams['newTempDlg'] == '1')
				{
					editorUi.actions.addAction('templates', function()
					{
						function driveObjToTempDlg(item)
						{
							return {id: item.id, isExt: true, url: item.downloadUrl, title: item.title, imgUrl: item.thumbnailLink,
									changedBy: item.lastModifyingUserName, lastModifiedOn: item.modifiedDate}
						};
						
						var tempDlg = new TemplatesDialog(editorUi, function(xml){console.log(arguments)}, null,
								null, null, 'user', function(callback, error, username)
						{
							var oneWeek = new Date();
							oneWeek.setDate(oneWeek.getDate() - 7);
							
							editorUi.drive.listFiles(null, oneWeek, username? true : false, function(resp)
							{
								var results = [];
								
								for (var i = 0; i < resp.items.length; i++)
								{
									results.push(driveObjToTempDlg(resp.items[i]));
								}
								
								callback(results);
							}, error)
						}, function(str, callback, error, username)
						{
							editorUi.drive.listFiles(str, null, username? true : false, function(resp)
							{
								var results = [];
								
								for (var i = 0; i < resp.items.length; i++)
								{
									results.push(driveObjToTempDlg(resp.items[i]));
								}
								
								callback(results);
							}, error)
						}, function(obj, callback, error)
						{
							editorUi.drive.getFile(obj.id, function(file)
							{
								callback(file.data);
							}, error);
						}, null, function(callback)
						{
							callback({'Test': []}, 1);
						}, true, false);
						
						editorUi.showDialog(tempDlg.container, window.innerWidth, window.innerHeight, true, false, null, false, true);
					});
					this.addMenuItem(menu, 'templates', parent);
				}
			}  // 非定制菜单
		})));

		this.put('file', new Menu(mxUtils.bind(this, function(menu, parent)
		{
			if (urlParams['customMenu'] == '1') { // yanwx, 1定制菜单
				//this.addMenuItems(menu, ['new','reloadDefaultAnswer'], parent);
				this.addMenuItems(menu, ['reloadDefaultAnswer'], parent);
				this.addMenuItems(menu, ['-', 'insertFormula','saveData'], parent);				
				this.addMenuItems(menu, ['-', 'pageSetup'], parent);
			}
			else {
				if (urlParams['embed'] == '1')
				{
					this.addSubmenu('importFrom', menu, parent);
					this.addSubmenu('exportAs', menu, parent);
					this.addSubmenu('embed', menu, parent);

					if (urlParams['libraries'] == '1')
					{
						this.addMenuItems(menu, ['-'], parent);
						this.addSubmenu('newLibrary', menu, parent);
						this.addSubmenu('openLibraryFrom', menu, parent);
					}
					
					if (editorUi.isRevisionHistorySupported())
					{
						this.addMenuItems(menu, ['-', 'revisionHistory'], parent);
					}
					
					this.addMenuItems(menu, ['-', 'pageSetup', 'print', '-', 'rename'], parent);
					
					if (urlParams['embedInline'] != '1')
					{
						if (urlParams['noSaveBtn'] == '1')
						{
							if (urlParams['saveAndExit'] != '0')
							{
								this.addMenuItems(menu, ['saveAndExit'], parent);
							}
						}
						else
						{
							this.addMenuItems(menu, ['save'], parent);
							
							if (urlParams['saveAndExit'] == '1')
							{
								this.addMenuItems(menu, ['saveAndExit'], parent);
							}
						}
					}
					
					if (urlParams['noExitBtn'] != '1')
					{
						this.addMenuItems(menu, ['exit'], parent);
					}
				}
				else
				{
					var file = this.editorUi.getCurrentFile();
					
					if (file != null && file.constructor == DriveFile)
					{
						if (file.isRestricted())
						{
							this.addMenuItems(menu, ['exportOptionsDisabled'], parent);
						}
						
						// yanwx, 删除 synchronize(同步) share...(共享)功能
						this.addMenuItems(menu, ['save', '-', 'formula', 'saveData', 'reanswer'], parent);
						// synchronize(同步) 
						var item = this.addMenuItem(menu, 'synchronize', parent);
						
						if (!editorUi.isOffline() || mxClient.IS_CHROMEAPP || EditorUi.isElectronApp)
						{
							this.addLinkToItem(item, 'https://www.diagrams.net/doc/faq/synchronize');
						}
						
						menu.addSeparator(parent);
					}
					else
					{
						this.addMenuItems(menu, ['new'], parent);
					}
					
					this.addSubmenu('openFrom', menu, parent);

					if (isLocalStorage)
					{
						this.addSubmenu('openRecent', menu, parent);
					}
					
					if (file != null && file.constructor == DriveFile)
					{
						this.addMenuItems(menu, ['new', '-', 'rename', 'makeCopy', 'moveToFolder'], parent);
					}
					else
					{
						// yanwx
						if (!mxClient.IS_CHROMEAPP && !EditorUi.isElectronApp &&
							file != null && (file.constructor != LocalFile ||
							file.fileHandle != null))
						{	
							menu.addSeparator(parent);
							var item = this.addMenuItem(menu, 'synchronize', parent);
							
							if (!editorUi.isOffline() || mxClient.IS_CHROMEAPP || EditorUi.isElectronApp)
							{
								this.addLinkToItem(item, 'https://www.diagrams.net/doc/faq/synchronize');
							}
						}
						
						this.addMenuItems(menu, ['-', 'save', 'saveAs', '-'], parent);
						
						if (!mxClient.IS_CHROMEAPP && !EditorUi.isElectronApp &&
							editorUi.getServiceName() == 'draw.io' &&
							!editorUi.isOfflineApp() && file != null)
						{
							this.addMenuItems(menu, ['insertFormula','saveData','reloadDefaultAnswer', '-'], parent);
						}
						
						this.addMenuItems(menu, ['rename'], parent);
						
						if (editorUi.isOfflineApp())
						{
							if (navigator.onLine && urlParams['stealth'] != '1' && urlParams['lockdown'] != '1')
							{
								this.addMenuItems(menu, ['upload'], parent);
							}
						}
						else
						{
							this.addMenuItems(menu, ['makeCopy'], parent);
							
							if (file != null && file.constructor == OneDriveFile)
							{
								this.addMenuItems(menu, ['moveToFolder'], parent);
							}
						}
					}
					
					menu.addSeparator(parent);
					this.addSubmenu('importFrom', menu, parent);
					this.addSubmenu('exportAs', menu, parent);
					menu.addSeparator(parent);
					this.addSubmenu('embed', menu, parent);
					this.addSubmenu('publish', menu, parent);
					menu.addSeparator(parent);
					this.addSubmenu('newLibrary', menu, parent);
					this.addSubmenu('openLibraryFrom', menu, parent);
					
					if (editorUi.isRevisionHistorySupported())
					{
						this.addMenuItems(menu, ['-', 'revisionHistory'], parent);
					}
					
					if (file != null && editorUi.fileNode != null && urlParams['embedInline'] != '1')
					{
						var filename = (file.getTitle() != null) ?
							file.getTitle() : editorUi.defaultFilename;
						
						if (!/(\.html)$/i.test(filename) &&
							!/(\.svg)$/i.test(filename))
						{
							this.addMenuItems(menu, ['-', 'properties']);
						}
					}
					
					this.addMenuItems(menu, ['-', 'pageSetup'], parent);
					
					// Cannot use print in standalone mode on iOS as we cannot open new windows
					if (!mxClient.IS_IOS || !navigator.standalone)
					{
						this.addMenuItems(menu, ['print'], parent);
					}

					this.addMenuItems(menu, ['-', 'close']);
				}
			} // 非定制菜单
		})));
		
		/**
		 * External Fonts undoable change
		 */
		function ChangeExtFonts(ui, extFonts, customFonts)
		{
			this.ui = ui;
			this.extFonts = extFonts;
			this.previousExtFonts = extFonts;
			this.customFonts = customFonts;
			this.prevCustomFonts = customFonts;
		};

		/**
		 * Implementation of the undoable External Fonts Change.
		 */
		ChangeExtFonts.prototype.execute = function()
		{
			var graph = this.ui.editor.graph;
			this.customFonts = this.prevCustomFonts;
			this.prevCustomFonts = this.ui.menus.customFonts;
			this.ui.fireEvent(new mxEventObject('customFontsChanged', 'customFonts', this.customFonts));
			
			this.extFonts = this.previousExtFonts;
			var tmp = graph.extFonts;
			
			for (var i = 0; tmp != null && i < tmp.length; i++)
			{
				var fontElem = document.getElementById('extFont_' + tmp[i].name);
				
				if (fontElem != null)
				{
					fontElem.parentNode.removeChild(fontElem);
				}
			}
			
			graph.extFonts = [];
			
			for (var i = 0; this.previousExtFonts != null && i < this.previousExtFonts.length; i++)
			{
				this.ui.editor.graph.addExtFont(this.previousExtFonts[i].name, this.previousExtFonts[i].url);
			}
			
			this.previousExtFonts = tmp;
		};

		//Replace the default font family menu
		this.put('fontFamily', new Menu(mxUtils.bind(this, function(menu, parent)
		{
			var addItem = mxUtils.bind(this, function(fontName, fontUrl, deletable, fontLabel, tooltip)
			{
				var graph = editorUi.editor.graph;

				var tr = this.styleChange(menu, fontLabel || fontName,
					(urlParams['ext-fonts'] != '1') ?
						[mxConstants.STYLE_FONTFAMILY, 'fontSource', 'FType'] : [mxConstants.STYLE_FONTFAMILY],
					(urlParams['ext-fonts'] != '1') ?
						[fontName, (fontUrl != null) ? encodeURIComponent(fontUrl) : null, null] : [fontName],
					null, parent, function()
				{
					if (urlParams['ext-fonts'] != '1')
					{
						graph.setFont(fontName, fontUrl);
					}
					else
					{
						document.execCommand('fontname', false, fontName);
						//Add the font to the file in case it was a previous font from the settings
						graph.addExtFont(fontName, fontUrl);
					}
					
					editorUi.fireEvent(new mxEventObject('styleChanged',
						'keys', (urlParams['ext-fonts'] != '1') ?
							[mxConstants.STYLE_FONTFAMILY, 'fontSource', 'FType'] : [mxConstants.STYLE_FONTFAMILY],
						'values', (urlParams['ext-fonts'] != '1') ?
							[fontName, (fontUrl != null) ? encodeURIComponent(fontUrl) : null, null] : [fontName],
						'cells', [graph.cellEditor.getEditingCell()]));
				}, function()
				{
					graph.updateLabelElements(graph.getSelectionCells(), function(elt)
					{
						elt.removeAttribute('face');
						elt.style.fontFamily = null;
						
						if (elt.nodeName == 'PRE')
						{
							graph.replaceElement(elt, 'div');
						}
					});
					
					//Add the font to the file in case it was a previous font from the settings
					if (urlParams['ext-fonts'] == '1')
					{
						graph.addExtFont(fontName, fontUrl);
					}
				});
				
				if (deletable)
				{
					var img = document.createElement('span');
					img.className = 'geSprite geSprite-delete';
					img.style.cursor = 'pointer';
					img.style.display = 'inline-block';
					tr.firstChild.nextSibling.nextSibling.appendChild(img);
					
					mxEvent.addListener(img, (mxClient.IS_POINTER) ? 'pointerup' : 'mouseup', mxUtils.bind(this, function(evt)
					{
						if (urlParams['ext-fonts'] != '1')
						{
							delete Graph.recentCustomFonts[fontName.toLowerCase()];
							
							for (var i = 0; i < this.customFonts.length; i++)
							{
								if (this.customFonts[i].name == fontName &&
									this.customFonts[i].url == fontUrl)
								{
									this.customFonts.splice(i, 1);
									editorUi.fireEvent(new mxEventObject('customFontsChanged'));
									
									break;
								}
							}
						}
						else
						{
							var extFonts = mxUtils.clone(this.editorUi.editor.graph.extFonts);
							
							if (extFonts != null && extFonts.length > 0)
							{
								for (var i = 0; i < extFonts.length; i++)
								{
									if (extFonts[i].name == fontName)
									{
										extFonts.splice(i, 1);
										break;
									}
								}
							}
							
							var customFonts = mxUtils.clone(this.customFonts);
							
							for (var i = 0; i < customFonts.length; i++)
							{
								if (customFonts[i].name == fontName)
								{
									customFonts.splice(i, 1);
									break;
								}
							}
							
							var change = new ChangeExtFonts(this.editorUi, extFonts, customFonts);
							this.editorUi.editor.graph.model.execute(change);
						}
						
						this.editorUi.hideCurrentMenu();
						mxEvent.consume(evt);
					}));
				}
				
				Graph.addFont(fontName, fontUrl);
				tr.firstChild.nextSibling.style.fontFamily = fontName;
				
				if (tooltip != null)
				{
					tr.setAttribute('title', tooltip);
				}
			});
			
			var reserved = {};

			for (var i = 0; i < this.defaultFonts.length; i++)
			{
				var value = this.defaultFonts[i];
				
				if (typeof value === 'string')
				{
					addItem(value);
				}
				else if (value.fontFamily != null && value.fontUrl != null)
				{
					reserved[encodeURIComponent(value.fontFamily) + '@' +
						encodeURIComponent(value.fontUrl)] = true;
					addItem(value.fontFamily, value.fontUrl);
				}
			}

			menu.addSeparator(parent);
			
			if (urlParams['ext-fonts'] != '1')
			{
				// Special entries in the font menu are composed of custom fonts
				// from the local storage and actual used fonts in the file
				var duplicates = {};
				var fontNames = {};
				var entries = [];
				
				function addEntry(entry)
				{
					var key = encodeURIComponent(entry.name) +
						((entry.url == null) ? '' :
						'@' + encodeURIComponent(entry.url));
						
					if (!reserved[key])
					{
						var label = entry.name;
						var counter = 0;
						
						while (fontNames[label.toLowerCase()] != null)
						{
							label = entry.name + ' (' + (++counter) + ')';
						}
						
						if (duplicates[key] == null)
						{
							entries.push({name: entry.name, url: entry.url,
								label: label, title: entry.url});
							fontNames[label.toLowerCase()] = entry;
							duplicates[key] = entry;
						}
					}
				};
				
				// Adds custom user defined fonts from local storage
				for (var i = 0; i < this.customFonts.length; i++)
				{
					addEntry(this.customFonts[i]);
				}
				
				// Adds fonts that were recently used in the editor
				for (var key in Graph.recentCustomFonts)
				{
					addEntry(Graph.recentCustomFonts[key]);
				}
				
				// Sorts by label
				entries.sort(function(a, b)
				{
					if (a.label < b.label)
					{
						return -1;
					}
					else if (a.label > b.label)
					{
						return 1;
					}
					else
					{
						return 0;
					}
				});
				
				if (entries.length > 0)
				{
					for (var i = 0; i < entries.length; i++)
					{
						addItem(entries[i].name, entries[i].url, true,
							entries[i].label, entries[i].url);
					}
	
					menu.addSeparator(parent);
				}
				
				menu.addItem(mxResources.get('reset'), null, mxUtils.bind(this, function()
				{
					Graph.recentCustomFonts = {};
					this.customFonts = [];
					editorUi.fireEvent(new mxEventObject('customFontsChanged'));
				}), parent);
				
				menu.addSeparator(parent);
			}
			else
			{
				//Load custom fonts already in the Graph
				var extFonts = this.editorUi.editor.graph.extFonts;
				
				//Merge external fonts with custom fonts
				if (extFonts != null && extFonts.length > 0)
				{
					var custMap = {}, changed = false;
					
					for (var i = 0; i < this.customFonts.length; i++)
					{
						custMap[this.customFonts[i].name] = true;
					}
					
					for (var i = 0; i < extFonts.length; i++)
					{
						if (!custMap[extFonts[i].name])
						{
							this.customFonts.push(extFonts[i]);
							changed = true;
						}
					}
					
					if (changed)
					{
						this.editorUi.fireEvent(new mxEventObject('customFontsChanged', 'customFonts', this.customFonts));
					}
				}
				
				if (this.customFonts.length > 0)
				{
					for (var i = 0; i < this.customFonts.length; i++)
					{
						var name = this.customFonts[i].name, url = this.customFonts[i].url;
						addItem(name, url, true);
						
						//Load external fonts without saving them to the file
						this.editorUi.editor.graph.addExtFont(name, url, true);
					}
					
					menu.addSeparator(parent);
					
					menu.addItem(mxResources.get('reset'), null, mxUtils.bind(this, function()
					{
						var change = new ChangeExtFonts(this.editorUi, [], []);
						editorUi.editor.graph.model.execute(change);
					}), parent);
					
					menu.addSeparator(parent);
				}
			}
			
			menu.addItem(mxResources.get('custom') + '...', null, mxUtils.bind(this, function()
			{
				var graph = this.editorUi.editor.graph;
				var curFontName = graph.getStylesheet().getDefaultVertexStyle()
					[mxConstants.STYLE_FONTFAMILY];
				var curType = 's';
				var curUrl = null;
				
				// Handles in-place editing custom fonts via font family lookup
				if (urlParams['ext-fonts'] != '1' && graph.isEditing())
				{
					var node = graph.getSelectedEditingElement();

					if (node != null)
					{
						var css = mxUtils.getCurrentStyle(node);

						if (css != null)
						{
							curFontName = Graph.stripQuotes(css.fontFamily);
							curUrl = Graph.getFontUrl(curFontName, null);
							
							if (curUrl != null)
							{
			    				if (Graph.isGoogleFontUrl(curUrl))
			    				{
			    					curUrl = null;
			    					curType = 'g';
			    				}
			    				else
			    				{
			    					curType = 'w';
			    				}
							}
						}
					}
				}
				else
				{
			    	var state = graph.getView().getState(graph.getSelectionCell());
			    	
			    	if (state != null)
			    	{
			    		curFontName = state.style[mxConstants.STYLE_FONTFAMILY] || curFontName;
			    		
			    		if (urlParams['ext-fonts'] != '1')
			    		{
			    			var temp = state.style['fontSource'];
			    			
			    			if (temp != null)
			    			{
				    			temp = decodeURIComponent(temp);
								
			    				if (Graph.isGoogleFontUrl(temp))
			    				{
			    					curType = 'g';
			    				}
			    				else
			    				{
			    					curType = 'w';
				    				curUrl = temp;
			    				}
			    			}
			    		}
			    		else
			    		{
			    			curType = state.style['FType'] || curType;
			    		
			    			if (curType == 'w')
			    			{
				    			var extFonts = this.editorUi.editor.graph.extFonts;
				    			var webFont = null;
				    			
				    			if (extFonts != null)
			    				{
				    				webFont = extFonts.find(function(ef)
		    						{
				    					return ef.name == curFontName;
		    						});
				    			}
				    			
				    			// TODO: Resource is not defined
				    			curUrl = webFont != null? webFont.url : mxResources.get('urlNotFound', null, 'URL not found');
			    			}
			    		}
			    	}
				}
		    	
    			if (curUrl != null && curUrl.substring(0, PROXY_URL.length) == PROXY_URL)
				{
    				curUrl = decodeURIComponent(curUrl.substr((PROXY_URL + '?url=').length));
				}
		    	
		    	// Saves the current selection state
		    	var selState = null;
		    	
		    	if (document.activeElement == graph.cellEditor.textarea)
				{
					selState = graph.cellEditor.saveSelection();
				}
		    	
				var dlg = new FontDialog(this.editorUi, curFontName, curUrl, curType, mxUtils.bind(this, function(fontName, fontUrl, type)
				{
					// Restores the selection state
					if (selState != null)
					{
						graph.cellEditor.restoreSelection(selState);
						selState = null;
					}
					
					if (fontName != null && fontName.length > 0)
					{
						if (urlParams['ext-fonts'] != '1' && graph.isEditing())
						{
							graph.setFont(fontName, fontUrl);
						}
						else
						{
							graph.getModel().beginUpdate();
							
							try
							{
								graph.stopEditing(false);
								
								if (urlParams['ext-fonts'] != '1')
								{
									graph.setCellStyles(mxConstants.STYLE_FONTFAMILY, fontName);
									graph.setCellStyles('fontSource', (fontUrl != null) ?
										encodeURIComponent(fontUrl) : null);
									graph.setCellStyles('FType', null);
								}
								else
								{
									graph.setCellStyles(mxConstants.STYLE_FONTFAMILY, fontName);
									
									if (type != 's')
									{
										graph.setCellStyles('FType', type);
										
										if (fontUrl.indexOf('http://') == 0)
										{
											fontUrl = PROXY_URL + '?url=' + encodeURIComponent(fontUrl);
										}
										
										this.editorUi.editor.graph.addExtFont(fontName, fontUrl);
									}
								}
								
								var addToCustom = true;
								
								for (var i = 0; i < this.customFonts.length; i++)
								{
									if (this.customFonts[i].name == fontName)
									{
										addToCustom = false;
										break;
									}
								}
								
								if (addToCustom)
								{
									this.customFonts.push({name: fontName, url: fontUrl});
									this.editorUi.fireEvent(new mxEventObject('customFontsChanged', 'customFonts', this.customFonts));
								}
							}
							finally
							{
								graph.getModel().endUpdate();
							}
						}
					}
				}));
				this.editorUi.showDialog(dlg.container, 380, Editor.enableWebFonts ? 250 : 180, true, true);
				dlg.init();
			}), parent, null, true);
		})));
	};
})();

////////////////////////////////////////////////////////////////
/**
 * exe2js_LoadDataFromExe：加载“考生作答”或“预置作答”数据
 * @param {*} szSvgXmlCode:XML格式 
 */
var exe2js_LoadDataFromExe = function(szSvgXmlCode) {
	/****************
	var szSvgXmlDemo = `
	<?xml version="1.0" encoding="UTF-8"?>
	  <mxfile host="10.33.1.93" modified="2021-11-17T03:37:24.311Z" agent="5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36" etag="62bmfzdsVxE7lANwyOxU" version="@DRAWIO-VERSION@"><diagram id="c7ikU0njrpY1M8Yy4mg5" name="第 1 页">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</diagram></mxfile>
	  `	  
	****************/
	//console.log("==> exe2js_LoadDataFromExe()", szSvgXmlCode);
	// 加载SVG
	var editorUi = window.editorUi;
	var data = Graph.zapGremlins(mxUtils.trim(szSvgXmlCode));
	editorUi.editor.graph.model.beginUpdate();
	try
	{
		editorUi.editor.setGraphXml(mxUtils.parseXml(data).documentElement);
		// this.editorUi.editor.graph.selectAll();   // 默认全部选中
	}
	catch (e)
	{
		error = e;
		console.log('loadcode(), 加载绘图, ', e.message);
		alert('加载绘图, ' + e.message);
	}
	finally
	{
		editorUi.editor.graph.model.endUpdate();
		// 设置图层
		let children = editorUi.editor.graph.model.root.children, activeIndex;
		if (children.length !== 0) {
			children.map((item, index) => {
			console.log(item);
			if (item.layer == "hytAnswerLayer" || item.value == "KSDrawingLayer") {
				activeIndex = index;
			}
			})
		}
		console.log(activeIndex);
		if (activeIndex) {
			editorUi.editor.graph.setDefaultParent(editorUi.editor.graph.model.getChildAt(editorUi.editor.graph.model.root, activeIndex));
		}
		// var cell = editorUi.editor.graph.addCell(new mxCell('设置图层'), editorUi.editor.graph.model.root);
		// editorUi.editor.graph.setDefaultParent(cell);				
	}
	//console.log("<== exe2js_LoadDataFromExe()");
} // exe2js_LoadDataFromExe

/**
 * exe2js_SaveDataToExe:保存答案
 * @isSaveAndQuit，false仅保存答案, true:保存答案并退出app；
 * @nSaveMode, [0为js2exe定时器保存，1为js2exe点击保存，2为exe2js调用保存];
 */
var exe2js_SaveDataToExe = function(isSaveAndQuit, nSaveMode) {
	// exe调用JS保存,并退出exe
	//console.log("<==> exe2js_SaveDataToExe()");
	//alert('exe2js_SaveDataToExe(isSaveAndQuit:'+isSaveAndQuit + ', nSaveMode:' + nSaveMode+')');
	window.editorUi.js2exe_SaveToAnswerArea(isSaveAndQuit, nSaveMode);   // 2：exe调用保存
	//window.editorUi.js2exe_SaveToAnswerArea(true, 2);   // 2：exe调用保存
} // exe2js_SaveDataToExe

////////////////////////////////////////////////////////////////