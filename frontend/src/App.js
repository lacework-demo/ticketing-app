import './App.css';
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilValue,
  DefaultValue,
  useSetRecoilState,
} from 'recoil';

import Container from '@mui/material/Container';
import {CircularProgress, Modal, FormGroup, Paper, TextField, Button, Grid, Box, Input} from '@mui/material';
import ResponsiveAppBar from './appbar';
import React from "react";
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import * as moment from "moment";

const Loading = ({loading}) => {
  if (loading) {
    return (
    <CircularProgress />
    )
  } else {
    return (
      <div />
    )
  }
}

function App() {
  const [loading, setLoading] = React.useState(false)

  return (
    <div className="App">
      <RecoilRoot>
        <ResponsiveAppBar />
        <Container maxWidth="xl">
          <Loading loading={loading} />
          <p>{moment(Date.now()).format()}</p>
          <Grid justifyContent="flex-start" alignItems="stretch">
            <Grid item xs={5} style={{textAlign: "left"}}>
              <Box sx={{my:4}}>
                <BasicModal setLoading={setLoading} />
              </Box>
            </Grid>
            <Grid item xs={7} style={{textAlign: "left"}}>
              <React.Suspense fallback={<div>Loading...</div>}>
                <Box sx={{my: 4, mt: 6}}>
                  <TicketListing />
                </Box>
              </React.Suspense>
            </Grid>
          </Grid>
        </Container>
      </RecoilRoot>
    </div>
  );
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function BasicModal({setLoading}) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button onClick={handleOpen}>Add Ticket</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <CreateTicket setLoading={setLoading} handleClose={handleClose} />
        </Box>
      </Modal>
    </div>
  );
}

const ticketListing = atom({
  key: 'ticketListing',
  default: 0,
})

const ticketListingSelector = selector({
  key: 'ticketListingSelectorValue',
  default: undefined,
  get: async ({get}) => {
    get(ticketListing)
    const data = await fetch(`/tickets`,
      {cache: 'no-cache', method: 'GET', headers: {"Content-Type": "application/json"}})
    return data.json()
  },
  set: ({set}, value) => {
    if (value instanceof DefaultValue) {
      set(ticketListing, v => v+1);
    }
  }
})

const CreateTicket = ({handleClose, setLoading}) => {
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [metadata, setMetadata] = React.useState("");
  const [contact, setContact] = React.useState("");
  const [asset, setAsset] = React.useState("");
  const onTextChange = e => setSubject(e.target.value);
  const onBodyChange = e => setBody(e.target.value);
  const onMetadataChange = e => setMetadata(e.target.value)
  const onContactChange = e => setContact(e.target.value)
  const onAssetChange = e => setAsset(e.target.value)

  const setTicketListing = useSetRecoilState(ticketListing)
  const sleep = (milliseconds) => {
      return new Promise(resolve => setTimeout(resolve, milliseconds))
  }


  const useSubmitForm = async () => {
    setLoading(true)
    handleClose()
    fetch(`/tickets`,
      {
        cache: 'no-cache',
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({subject, body, metadata, asset, email: contact}),
      })
      .catch(err => {
        console.log(err.message)
      })
    await sleep(1000)
    setTicketListing(v => v + 1)
    setLoading(false)
  }

  return (
    <form id="ticket-form">
      <FormGroup>
        <h3>Ticket Contact</h3>
        <Input id="ticket-contact" value={contact} onChange={onContactChange} />
        <h3>Ticket Subject</h3>
        <Input id="ticket-sub" value={subject} onChange={onTextChange} />
        <h3>Ticket Description</h3>
        <TextField id="ticket-body" value={body} multiline={true} rows={5} onChange={onBodyChange} />
        <h3>Ticket Asset</h3>
        <Input id="ticket-asset" value={asset} onChange={onAssetChange} />
        <h3>Ticket Metadata(optional)</h3>
        <TextField id="ticket-metadata" value={metadata} multiline={true} rows={2} onChange={onMetadataChange} />
        <div style={{marginTop:"1em"}} />
        <Button variant="contained" color="primary" type="button" onClick={useSubmitForm}>Submit</Button>
      </FormGroup>
    </form>
  )
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));


function TicketListing() {
  const tickets = useRecoilValue(ticketListingSelector);
  if (tickets === undefined) {
    return (
      <div>
        <h3>No tickets found</h3>
      </div>
    )
  } else {
    return (
      <TableContainer component={Paper}>
        <Table sx={{minWidth: 700}} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell align="left">Contact</StyledTableCell>
              <StyledTableCell>Subject</StyledTableCell>
              <StyledTableCell align="left">Body</StyledTableCell>
              <StyledTableCell align="left">ID</StyledTableCell>
              <StyledTableCell align="left">Asset</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.map(t => (
              <StyledTableRow key={t._id}>
                <StyledTableCell align="left">{t.contactId}</StyledTableCell>
                <StyledTableCell align="left">{t.subject}</StyledTableCell>
                <StyledTableCell align="left">{t.body}</StyledTableCell>
                <StyledTableCell align="left">{t._id}</StyledTableCell>
                <StyledTableCell align="left">{t.assetId}</StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }
}

export default App;
