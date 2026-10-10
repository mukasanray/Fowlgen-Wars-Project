using Onix.Framework.Notifications.Interfaces;
using Onix.Framework.Shared.Interfaces;
using Onix.Framework.Shared.Results;

namespace Onix.Fowlgenwars.Core.Application.Base
{
    public abstract class AppServiceBase
    {
        protected readonly INotificationContext NotificationContext;

        public AppServiceBase(INotificationContext notificationContext)
        {
            NotificationContext = notificationContext;
        }

        protected virtual IRequestResult CriarRequestResult()
        {
            return new RequestResult(NotificationContext.GetNotifications());
        }

        protected virtual IRequestDataResult<T> CriarRequestDataResult<T>(T result)
        {
            return new RequestDataResult<T>(NotificationContext.GetNotifications(), result);
        }
    }
}
