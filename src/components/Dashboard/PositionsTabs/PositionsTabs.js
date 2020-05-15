import React, { useState } from 'react';
import './PositionsTabs.scss';
import { Box, Tab, Tabs, Popover} from '@material-ui/core';
import SettingsIcon from '../../../images/dashboard/settings.svg';
import FiltersUnchecked from '../../../images/dashboard/filtersHollow.svg';
import FilstersChecked from '../../../images/dashboard/filtersFill.svg';
import PositionSettingsForm from '../../Forms/PositionSettingsForm';
import PositionsTable from '../PositionsTable';
import PositionFilters from '../PositionFilters';

const PositionsTabs = (props) => {
    const [tabValue, setTabValue] = useState(0)
    const [settingsAnchor, setSettingAnchor] = useState(undefined)
    const [filters, showFilters] = useState(false)

    const changeTab = (event, newValue) => {
        setTabValue(newValue)
    };

    return(
        <Box bgcolor="grid.content" className="positionsTabs">
            <Box className="tabsBox" display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
                <Tabs value={tabValue} onChange={changeTab} classes={{indicator: 'indicator', flexContainer: 'container'}} className="tabs-menu">
                    <Tab label="open positions" classes={{selected: 'selected'}} />
                    <Tab label="closed positions" classes={{selected: 'selected'}} />
                    <Tab label="logs" classes={{selected: 'selected'}} />
                </Tabs>
                <Box className="settings" display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
                    <img onClick={() => showFilters(!filters)} src={filters ? FilstersChecked : FiltersUnchecked} alt="zignaly" className="icon" />
                    <img onClick={(e) => setSettingAnchor(e.currentTarget)} src={SettingsIcon} alt="zignaly" className="icon" />
                </Box>
            </Box>
            {filters &&
                <PositionFilters onClose={() => showFilters(false)} />
            }
            {tabValue === 0 &&
                <Box className="tabPanel">
                    <PositionsTable />
                </Box>
            }
            {tabValue === 1 &&
                <Box className="tabPanel">
                    <PositionsTable />
                </Box>
            }
            {tabValue === 2 &&
                <Box className="tabPanel">
                    <PositionsTable />
                </Box>
            }
            <Popover
                open={Boolean(settingsAnchor)}
                onClose={() => setSettingAnchor(undefined)}
                anchorEl={settingsAnchor}
                anchorOrigin={{vertical: 'top',horizontal: 'left',}}
                transformOrigin={{vertical: 'top',horizontal: 'right',}}>

                <PositionSettingsForm onClose={() => setSettingAnchor(undefined)} />
            </Popover>
        </Box>
    )
}

export default PositionsTabs;