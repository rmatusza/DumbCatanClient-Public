import { useContext } from "react";
import Modal from "../../UI/Modal";
import EditUserAndPasswordModalContent from './EditUserAndPasswordModalContent';
import EditProfileModalContent from "./EditProfileModalContent";
import EditAvatarModalContent from "./EditAvatarModalContent";
import CreateGameModalContent from "./CreateGameModalContent";
import InvitationModalContent from "./InvitationModalContent";
import TradeModalContent from "./TradeModalContent";
import BuyDevCardModalContent from "./BuyDevCardModalContent";
import OverSevenCardPenaltyModalContent from "./OverSevenCardPenaltyModalContent";
import ResourceStealingModalContent from "./ResourceStealingModalContent";
import BuildConfirmationModalContent from "./BuildConfirmationModalContent";
import PlayDevCardModalContent from "./PlayDevCardModalContent";
import YearOfPlentyModalContent from "./YearOfPlentyModalContent";
import DevConsoleModalContent from "./DevConsoleModalContent";
import MonopolyModalContent from "./MonopolyModalContent";
import GameOverModalContent from "./GameOverModalContent";
import InfoModalContent from "./InfoModalContent";
import StolenResourceUpdateModalContent from "./StolenResourceUpdateModalContent";
import RecoveryModalContent from "./RecoveryModalContent";
import ConfirmationModalContent from "./ConfirmationModalContent";
import ModalStateContext from "../../store/modal-context";

const Modals = (props) => {

  const ctx = useContext(ModalStateContext);

  return (
    <>

      {
        ctx.editProfileModalActive
        &&
        <Modal modalType={'editProfile'}>
          {
            ctx.editUsernameAndPassword
            &&
            <EditUserAndPasswordModalContent modalType={'editProfile'} onSetPlayerName={props.onSetPlayerName} />
          }
          {
            ctx.editAvatar
            &&
            <EditAvatarModalContent modalType={'editProfile'} onSetPlayerName={props.onSetPlayerName} onSetAvatarURL={props.onSetAvatarURL} />
          }
          {
            (!ctx.editUsernameAndPassword && !ctx.editAvatar)
            &&
            <EditProfileModalContent modalType={'none'} />
          }
        </Modal>
      }

      {
        ctx.createGameModalActive
        &&
        <Modal styles="create-game-modal-container">
          <CreateGameModalContent />
        </Modal>
      }

      {
        ctx.invitationModalActive
        &&
        <Modal styles="invitation-modal-container">
          <InvitationModalContent />
        </Modal>
      }

      {
        ctx.tradeModalActive
        &&
        <Modal styles="confirm-trade-modal-container">
          <TradeModalContent />
        </Modal>
      }

      {
        ctx.devCardModalActive
        &&
        <Modal styles="confirm-trade-modal-container">
          <BuyDevCardModalContent />
        </Modal>
      }

      {
        ctx.overSevenCardPenaltyModalActive
        &&
        <Modal styles="confirm-trade-modal-container">
          <OverSevenCardPenaltyModalContent />
        </Modal>
      }

      {
        ctx.resourceStealingModalActive
        &&
        <Modal styles="confirm-trade-modal-container">
          <ResourceStealingModalContent />
        </Modal>
      }

      {
        ctx.buildConfirmationModalActive
        &&
        <Modal styles="confirm-trade-modal-container">
          <BuildConfirmationModalContent />
        </Modal>
      }

      {
        ctx.playDevCardModalActive
        &&
        <Modal styles="confirm-trade-modal-container">
          <PlayDevCardModalContent />
        </Modal>
      }

      {
        ctx.yearOfPlentyModalActive
        &&
        <Modal styles="confirm-trade-modal-container">
          <YearOfPlentyModalContent />
        </Modal>
      }

      {
        ctx.monopolyModalActive
        &&
        <Modal styles="confirm-trade-modal-container">
          <MonopolyModalContent />
        </Modal>
      }

      {
        ctx.gameOverModalActive
        &&
        <Modal styles="confirm-trade-modal-container">
          <GameOverModalContent />
        </Modal>
      }

      {
        ctx.devConsoleModalActive
        &&
        <Modal styles="create-game-modal-container">
          <DevConsoleModalContent />
        </Modal>
      }

      {
        ctx.stolenResourceUpdateModalActive
        &&
        <Modal styles="create-game-modal-container">
          <StolenResourceUpdateModalContent />
        </Modal>
      }

      {
        ctx.infoModalActive
        &&
        <Modal styles="create-game-modal-container">
          <InfoModalContent />
        </Modal>
      }

      {
        ctx.recoveryModalActive
        &&
        <Modal styles="create-game-modal-container">
          <RecoveryModalContent styles="create-game-modal-container" />
        </Modal>
      }

      {
        ctx.confirmationModalActive
        &&
        <Modal styles="create-game-modal-container">
          <ConfirmationModalContent styles="create-game-modal-container" />
        </Modal>
      }
    </>
  )
}

export default Modals;